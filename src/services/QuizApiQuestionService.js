import {
  QUESTIONS_PER_CATEGORY_SET,
  QUESTIONS_PER_PLAYER,
} from '../gameConfig.js'

export default class QuizApiQuestionService {
  constructor(
    repository,
    questionsPerCategorySet = QUESTIONS_PER_CATEGORY_SET,
  ) {
    this.repository = repository
    this.questionsPerCategorySet = questionsPerCategorySet
  }

  async getCategoryQuestionSets(category) {
    const questions = await this.loadQuestions(category)

    return {
      chooserQuestions: questions.slice(0, QUESTIONS_PER_PLAYER),
      opponentQuestions: questions.slice(
        QUESTIONS_PER_PLAYER,
        this.questionsPerCategorySet,
      ),
    }
  }

  async loadQuestions(category) {
    try {
      const apiQuestions = await this.fetchFromQuizApi(category)

      if (apiQuestions.length < this.questionsPerCategorySet) {
        throw new Error('The quiz API returned too few questions.')
      }

      return this.repository.ingestQuestions(
        category.categoryId,
        apiQuestions.slice(0, this.questionsPerCategorySet),
      )
    } catch {
      return this.repository.getQuestionSet(
        category.categoryId,
        this.questionsPerCategorySet,
      )
    }
  }

  async fetchFromQuizApi(category) {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryId: category.categoryId,
        categoryName: category.name,
        count: this.questionsPerCategorySet,
      }),
    })

    if (!response.ok) {
      throw new Error(`Quiz API request failed: ${response.status}`)
    }

    const payload = await response.json()

    if (!Array.isArray(payload.questions)) {
      throw new Error('Quiz API payload was invalid.')
    }

    return payload.questions
  }
}
