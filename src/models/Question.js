export default class Question {
  constructor(questionId, prompt, options, correctAnswer, categoryId) {
    if (!questionId || !prompt || !categoryId) {
      throw new Error('Question requires an id, prompt and category id.')
    }

    if (!Array.isArray(options) || options.length < 2) {
      throw new Error('Question requires at least two answer options.')
    }

    if (!options.includes(correctAnswer)) {
      throw new Error('The correct answer must be included in the options.')
    }

    this.questionId = questionId
    this.prompt = prompt
    this.options = [...options]
    this.correctAnswer = correctAnswer
    this.categoryId = categoryId
  }

  checkAnswer(answer) {
    return String(answer).trim().toLowerCase() === this.correctAnswer.toLowerCase()
  }

  getCorrectAnswer() {
    return this.correctAnswer
  }
}
