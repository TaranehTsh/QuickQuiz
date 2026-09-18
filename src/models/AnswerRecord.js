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
    this.isCorrect = Boolean(isCorrect) // developer-Hafsa
    this.timeRemaining = Math.max(0, Number(timeRemaining) || 0) // developer-Tim
  }

  getResult() {
    return this.isCorrect
  }
}
