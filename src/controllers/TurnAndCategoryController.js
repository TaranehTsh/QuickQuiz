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
