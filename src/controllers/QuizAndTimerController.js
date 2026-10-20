import { CHALLENGES_PER_GAME, QUESTIONS_PER_PLAYER } from '../gameConfig.js'
import Challenge from '../models/Challenge.js'
import QuizRound from '../models/QuizRound.js'

// starts questions, checks answers, and keeps the timer limit
export default class QuizAndTimerController {
  constructor(
    gameSession,
    repository,
    playerResults,
    timeLimitSeconds = 15,
  ) {
    this.gameSession = gameSession
    this.repository = repository
    this.playerResults = playerResults
    this.timeLimitSeconds = timeLimitSeconds // developer-Tim
  }

  // developer-Leon: practice uses one player and has no opponent handoff.
  startPractice(categoryId, questions) {
    if (this.gameSession.mode !== 'practice') {
      throw new Error('Practice requires a single-player session.')
    }
    this.repository.getCategory(categoryId)
    if (!Array.isArray(questions) || questions.length !== QUESTIONS_PER_PLAYER) {
      throw new Error(`Practice requires ${QUESTIONS_PER_PLAYER} questions.`)
    }
    this.gameSession.activePlayerId = this.gameSession.players[0].playerId
    this.gameSession.selectedCategoryId = categoryId
    return this.startPlayerQuestionSet(this.gameSession.activePlayerId, questions)
  }

  // developer-Leon: both players get the same tie-break question.
  startSuddenDeath(question) {
    this.gameSession.startSuddenDeath(question)
    return this.startSuddenDeathTurn()
  }

  startSuddenDeathTurn() {
    const suddenDeath = this.gameSession.suddenDeath
    const nextPlayerId = suddenDeath?.getNextPlayerId()
    if (!nextPlayerId || !['sudden-death', 'sudden-death-handoff'].includes(this.gameSession.roundState)) {
      throw new Error('There is no sudden-death turn ready to start.')
    }
    this.gameSession.activePlayerId = nextPlayerId
    return this.startPlayerQuestionSet(nextPlayerId, [suddenDeath.question])
  }

  finishSuddenDeathTurn() {
    const suddenDeath = this.gameSession.suddenDeath
    const round = this.gameSession.getCurrentRound()
    if (!suddenDeath || !round || round.playerId !== this.gameSession.activePlayerId ||
        !round.isComplete() || this.gameSession.roundState !== 'feedback') {
      throw new Error('The active player must answer the sudden-death question first.')
    }
    suddenDeath.submitResult(round.playerId, round.answerRecords[0].getResult())
    const outcome = suddenDeath.getOutcome()
    if (outcome.state === 'waiting') {
      this.gameSession.activePlayerId = suddenDeath.getNextPlayerId()
      this.gameSession.roundState = 'sudden-death-handoff'
    } else if (outcome.state === 'repeat') {
      this.gameSession.roundState = 'sudden-death-repeat'
    } else {
      this.gameSession.finishRound()
    }
    return outcome
  }

  // developer-Taraneh
  // first player in the set answers their 3
  startChooserTurn(categoryId, chooserQuestions, opponentQuestions) {
    const chooserId = this.gameSession.categoryChooserId
    const challenge = new Challenge(
      this.gameSession.challenges.length + 1,
      categoryId,
      chooserId,
      this.gameSession.getOpponentId(chooserId),
      chooserQuestions,
      opponentQuestions,
    )

    this.gameSession.startChallenge(challenge)
    return this.startPlayerQuestionSet(chooserId, chooserQuestions)
  }

  // second player, same category, different 3 questions
  startOpponentTurn() {
    const challenge = this.gameSession.currentChallenge

    if (!challenge) {
      throw new Error('There is no active challenge.')
    }

    this.gameSession.activePlayerId = challenge.opponentPlayerId
    return this.startPlayerQuestionSet(
      challenge.opponentPlayerId,
      challenge.opponentQuestions,
    )
  }

  startPlayerQuestionSet(playerId, questions) {
    const round = new QuizRound(
      this.gameSession.rounds.length + 1,
      this.gameSession.selectedCategoryId,
      playerId,
      questions,
      this.timeLimitSeconds,
    )

    this.gameSession.addRound(round)
    this.gameSession.roundState = 'question'
    return round.startQuestion()
  }

  // next question for the same player, or null if their 3 are done
  continueIfMoreQuestions() {
    const round = this.gameSession.getCurrentRound()

    if (!round || round.isComplete()) {
      return null
    }

    if (round.playerId !== this.gameSession.activePlayerId || this.gameSession.roundState !== 'feedback') {
      throw new Error('Answer the current question before continuing.')
    }
    this.gameSession.roundState = 'question'
    return round.startQuestion()
  }

  finishActivePlayerTurn() {
    const round = this.gameSession.getCurrentRound()

    if (!round) {
      throw new Error('There is no active question set.')
    }

    if (!round.isComplete()) {
      throw new Error('Answer all questions before finishing the turn.')
    }
    if (round.playerId !== this.gameSession.activePlayerId) {
      throw new Error('Only the active player can finish this turn.')
    }
    if (this.gameSession.mode === 'practice') {
      this.gameSession.finishRound()
      return { practiceComplete: true }
    }

    return this.gameSession.completePlayerTurn(
      this.gameSession.activePlayerId,
      round.getCorrectCount(),
    )
  }

  // developer-Hafsa
  // mark right/wrong and keep the correct answer for feedback
  checkAnswer(playerId, answer, timeRemaining = this.timeLimitSeconds) {
    if (playerId !== this.gameSession.activePlayerId) {
      throw new Error('The answer must come from the active player.')
    }

    const round = this.gameSession.getCurrentRound()
    const question = round?.getCurrentQuestion()

    if (!round || !question) {
      throw new Error('There is no active question.')
    }

    if (round.playerId !== playerId) {
      throw new Error('The active player must start their own question set first.')
    }
    if (round.answerRecords.length > round.currentQuestionIndex) {
      throw new Error('This question has already been answered.')
    }
    if (this.gameSession.roundState !== 'question') {
      throw new Error('There is no active question ready for an answer.')
    }

    // developer-Leon: a late answer cannot earn points, even if it is correct.
    const remaining = Math.max(0, Math.min(this.timeLimitSeconds, Number(timeRemaining) || 0))
    const submittedAnswer = remaining > 0 ? answer : ''
    const validation = this.repository.validateAnswer(
      question.questionId,
      submittedAnswer,
    )
    const answerRecord = round.submitAnswer(submittedAnswer, remaining)
    const player = this.gameSession.getPlayer(playerId)

    player.recordAnswer(validation.isCorrect)
    this.playerResults.recordAnswer(answerRecord)
    this.gameSession.roundState = 'feedback'

    return {
      answerRecord,
      isCorrect: validation.isCorrect,
      correctAnswer: validation.correctAnswer,
      submittedAnswer: submittedAnswer || null,
      timedOut: remaining === 0, // developer-Tim
    }
  }

  isQuizComplete(totalChallenges = CHALLENGES_PER_GAME) {
    return this.gameSession.isGameComplete(totalChallenges)
  }
}
