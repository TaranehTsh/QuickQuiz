import AnswerRecord from './AnswerRecord.js'

// one player's 3 questions in the current set
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
    this.timeLimitSeconds = timeLimitSeconds // developer-Tim
    this.questions = [...questions]
    this.currentQuestionIndex = -1 // nothing started yet
    this.answerRecords = []
  }

  startQuestion() {
    if (this.currentQuestionIndex + 1 >= this.questions.length) {
      return null // no more questions for this player
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
      timeRemaining, // developer-Tim
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
