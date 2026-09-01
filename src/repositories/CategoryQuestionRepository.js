import Category from '../models/Category.js'
import Question from '../models/Question.js'

export default class CategoryQuestionRepository {
  constructor(categories = []) {
    this.categories = categories.map((category) => {
      const questions = category.questions.map(
        (question) =>
          new Question(
            question.questionId,
            question.prompt,
            question.options,
            question.correctAnswer,
            category.categoryId,
          ),
      )

      return new Category(
        category.categoryId,
        category.name,
        category.colour,
        questions,
      )
    })

    this.questionCursor = new Map()
  }

  getCategories() {
    return [...this.categories]
  }

  getCategory(categoryId) {
    const category = this.categories.find(
      (item) => item.categoryId === categoryId,
    )

    if (!category) {
      throw new Error(`Unknown category: ${categoryId}`)
    }

    return category
  }

  getQuestion(categoryId) {
    const category = this.getCategory(categoryId)
    const questions = category.getQuestions()
    const currentIndex = this.questionCursor.get(categoryId) ?? 0
    const question = questions[currentIndex % questions.length]

    this.questionCursor.set(categoryId, currentIndex + 1)
    return question
  }

  getQuestionById(questionId) {
    for (const category of this.categories) {
      const question = category
        .getQuestions()
        .find((item) => item.questionId === questionId)

      if (question) {
        return question
      }
    }

    throw new Error(`Unknown question: ${questionId}`)
  }

  validateAnswer(questionId, answer) {
    const question = this.getQuestionById(questionId)

    return {
      isCorrect: question.checkAnswer(answer),
      correctAnswer: question.getCorrectAnswer(),
    }
  }
}
