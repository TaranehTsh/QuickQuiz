export default class AnswerRecord {
  constructor(
    playerId,
    questionId,
    submittedAnswer,
    isCorrect,
    timeRemaining,
  ) {
    this.playerId = playerId
    this.questionId = questionId
    this.submittedAnswer = submittedAnswer
    this.isCorrect = Boolean(isCorrect)
    this.timeRemaining = Math.max(0, Number(timeRemaining) || 0)
  }

  getResult() {
    return this.isCorrect
  }
}
