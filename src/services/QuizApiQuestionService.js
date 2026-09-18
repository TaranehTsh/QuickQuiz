import Question from '../models/Question.js'
import {
  QUESTIONS_PER_CATEGORY_SET,
  QUESTIONS_PER_PLAYER,
} from '../gameConfig.js'

// this moves things around in a list so the order is different each time
function shuffle(items) {
  const copy = [...items] // makes a copy so we do not mess up the real list

  for (let index = copy.length - 1; index > 0; index -= 1) { // walks backwards through the list
    const swapIndex = Math.floor(Math.random() * (index + 1)) // picks a random spot to swap with
    const temp = copy[index] // remember this item for a second
    copy[index] = copy[swapIndex] // moves the random item into this spot
    copy[swapIndex] = temp // puts the remembered item into the random spot
  }

  return copy // send back the mixed up list
}

export default class QuizApiQuestionService {
  constructor(
    repository,
    questionsPerCategorySet = QUESTIONS_PER_CATEGORY_SET,
  ) {
    this.repository = repository
    this.questionsPerCategorySet = questionsPerCategorySet
  }

  async getCategoryQuestionSets(category) {
    const questions = await this.loadQuestions(category) // gets the 6 questions for this topic
    const shuffledQuestions = shuffle(questions) // mixes up the order of all 6 questions
    const finalQuestions = [] // this holds the new questions with mixed up answers

    for (let index = 0; index < shuffledQuestions.length; index += 1) { 
      const question = shuffledQuestions[index] // the question we are working on right now
      const shuffledOptions = shuffle(question.options) // mix up this question's answer options

      const newQuestion = new Question( // this makes a new question that looks the same but with new answer order
        question.questionId, 
        question.prompt, 
        shuffledOptions, // the same answers, but now in a random order
        question.correctAnswer, 
        question.categoryId, 
      )

      finalQuestions.push(newQuestion) // add it to our new list
    }

    return {
      chooserQuestions: finalQuestions.slice(0, QUESTIONS_PER_PLAYER), // first ones go to the chooser
      opponentQuestions: finalQuestions.slice(
        QUESTIONS_PER_PLAYER,
        this.questionsPerCategorySet,
      ), // the rest go to the opponent
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
      // API failed — use the local question bank instead
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
