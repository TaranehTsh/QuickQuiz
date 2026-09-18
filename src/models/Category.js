export default class Category {
  constructor(categoryId, name, colour, questions = []) {
    if (!categoryId || !name || !colour) {
      throw new Error('Category requires an id, name and colour.')
    }

    this.categoryId = categoryId
    this.name = name
    this.colour = colour // developer-Leon
    this.questions = [...questions]
  }

  getQuestions() {
    return [...this.questions]
  }

  addQuestions(questions) {
    this.questions.push(...questions)
  }

  // developer-Leon
  getColour() {
    return this.colour
  }
}
