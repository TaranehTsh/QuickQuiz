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

  startRound(categoryId) {
    const question = this.repository.getQuestion(categoryId)
    const round = new QuizRound(
      this.gameSession.rounds.length + 1,
      categoryId,
      this.gameSession.activePlayerId,
      [question],
      this.timeLimitSeconds,
    )

    this.gameSession.addRound(round)
    return round.startQuestion()
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

  isQuizComplete(totalRounds) {
    return this.gameSession.rounds.length >= totalRounds
  }
}
