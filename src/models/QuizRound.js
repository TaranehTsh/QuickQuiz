import AnswerRecord from './AnswerRecord.js'

export default class QuizRound {
  constructor(
    roundNumber,
    selectedCategoryId,
    playerId,
    questions,
    timeLimitSeconds = 15,
  ) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('QuizRound requires at least one question.')
    }

    this.roundNumber = roundNumber
    this.selectedCategoryId = selectedCategoryId
    this.playerId = playerId
    this.timeLimitSeconds = timeLimitSeconds
    this.questions = [...questions]
    this.currentQuestionIndex = -1
    this.answerRecords = []
  }

  startQuestion() {
    if (this.currentQuestionIndex + 1 >= this.questions.length) {
      return null
    }

    this.currentQuestionIndex += 1
    return this.getCurrentQuestion()
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex] ?? null
  }

  submitAnswer(answer, timeRemaining = this.timeLimitSeconds) {
    const question = this.getCurrentQuestion()

    if (!question) {
      throw new Error('A question must be started before an answer is submitted.')
    }

    const record = new AnswerRecord(
      this.playerId,
      question.questionId,
      answer,
      question.checkAnswer(answer),
      timeRemaining,
    )

    this.answerRecords.push(record)
    return record
  }

  isComplete() {
    return this.answerRecords.length >= this.questions.length
  }

  getCorrectCount() {
    return this.answerRecords.filter((record) => record.getResult()).length
  }
}
