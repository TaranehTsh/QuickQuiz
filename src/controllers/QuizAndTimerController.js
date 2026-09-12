import { CHALLENGES_PER_GAME } from '../gameConfig.js'
import Challenge from '../models/Challenge.js'
import QuizRound from '../models/QuizRound.js'

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
    this.timeLimitSeconds = timeLimitSeconds
  }

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

  continueIfMoreQuestions() {
    const round = this.gameSession.getCurrentRound()

    if (!round || round.isComplete()) {
      return null
    }

    this.gameSession.roundState = 'question'
    return round.startQuestion()
  }

  finishActivePlayerTurn() {
    const round = this.gameSession.getCurrentRound()

    if (!round) {
      throw new Error('There is no active question set.')
    }

    return this.gameSession.completePlayerTurn(
      this.gameSession.activePlayerId,
      round.getCorrectCount(),
    )
  }

  checkAnswer(playerId, answer, timeRemaining) {
    if (playerId !== this.gameSession.activePlayerId) {
      throw new Error('The answer must come from the active player.')
    }

    const round = this.gameSession.getCurrentRound()
    const question = round?.getCurrentQuestion()

    if (!round || !question) {
      throw new Error('There is no active question.')
    }

    const validation = this.repository.validateAnswer(
      question.questionId,
      answer,
    )
    const answerRecord = round.submitAnswer(answer, timeRemaining)
    const player = this.gameSession.getPlayer(playerId)

    player.recordAnswer(validation.isCorrect)
    this.playerResults.recordAnswer(answerRecord)
    this.gameSession.roundState = 'feedback'

    return {
      answerRecord,
      isCorrect: validation.isCorrect,
      correctAnswer: validation.correctAnswer,
      submittedAnswer: answer || null,
      timedOut: timeRemaining === 0,
    }
  }

  isQuizComplete(totalChallenges = CHALLENGES_PER_GAME) {
    return this.gameSession.isGameComplete(totalChallenges)
  }
}
