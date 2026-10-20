// developer-Taraneh
// category pick + whose turn it is
export default class TurnAndCategoryController {
  constructor(gameSession, repository) {
    this.gameSession = gameSession
    this.repository = repository
  }

  // developer-Taraneh
  chooseCategory(playerId, categoryId) {
    if (playerId !== this.gameSession.categoryChooserId) {
      throw new Error('Only the category chooser can select a category.')
    }

    const category = this.repository.getCategory(categoryId)
    this.gameSession.selectCategory(categoryId, playerId)

    return {
      playerId,
      categoryId,
      colour: category.getColour(), // developer-Leon
      category,
    }
  }

  // developer-Will
  // this picks one category by luck and gives back its id
  pickRandomCategoryId() {
    // get the list of every category we have
    const categories = this.repository.getCategories()

    // if the list is empty there is nothing to pick
    if (categories.length === 0) {
      throw new Error('There are no categories to pick from.')
    }

    // pick a spot number by luck, from the first spot to the last spot
    const spot = Math.floor(Math.random() * categories.length)

    // give back the id of the category sitting in that spot
    return categories[spot].categoryId
  }

  // developer-Taraneh
  startNextChooserTurn() {
    this.gameSession.rotateChooser()
    return this.getTurnState()
  }

  // developer-Taraneh
  alternateActivePlayer() {
    this.gameSession.alternateActivePlayer()
    return this.gameSession.activePlayerId
  }

  getTurnState() {
    return {
      activePlayerId: this.gameSession.activePlayerId,
      categoryChooserId: this.gameSession.categoryChooserId,
      selectedCategoryId: this.gameSession.selectedCategoryId,
      roundState: this.gameSession.roundState,
    }
  }
}
