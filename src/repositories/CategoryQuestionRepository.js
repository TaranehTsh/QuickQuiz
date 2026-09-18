import Category from '../models/Category.js'
import Question from '../models/Question.js'

// developer-Will
function shuffle(items) {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

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
        category.colour, // developer-Leon
        questions,
      )
    })

    this.questionCursor = new Map()
    this.usedQuestionIds = new Map()
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
    const questions = this.getQuestionSet(categoryId, 1)
    return questions[0]
  }

  getQuestionSet(categoryId, count) {
    const category = this.getCategory(categoryId)
    const usedIds = this.usedQuestionIds.get(categoryId) ?? new Set()
    const allQuestions = category.getQuestions()
    const unusedQuestions = allQuestions.filter(
      (question) => !usedIds.has(question.questionId),
    )
    const pool =
      unusedQuestions.length >= count ? unusedQuestions : allQuestions
    const selected = shuffle(pool).slice(0, count)

    if (selected.length < count) {
      throw new Error(
        `Category ${categoryId} needs at least ${count} questions.`,
      )
    }

    const nextUsed = new Set(usedIds)
    selected.forEach((question) => nextUsed.add(question.questionId))
    this.usedQuestionIds.set(categoryId, nextUsed)

    return selected
  }

  ingestQuestions(categoryId, rawQuestions) {
    const category = this.getCategory(categoryId)
    const questions = rawQuestions.map(
      (question) =>
        new Question(
          question.questionId,
          question.prompt,
          question.options,
          question.correctAnswer,
          categoryId,
        ),
    )

    category.addQuestions(questions)
    return questions
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
