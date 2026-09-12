export default class TurnAndCategoryController {
  constructor(gameSession, repository) {
    this.gameSession = gameSession
    this.repository = repository
  }

  chooseCategory(playerId, categoryId) {
    if (playerId !== this.gameSession.categoryChooserId) {
      throw new Error('Only the category chooser can select a category.')
    }

    const category = this.repository.getCategory(categoryId)
    this.gameSession.selectCategory(categoryId, playerId)

    return {
      playerId,
      categoryId,
      colour: category.getColour(),
      category,
    }
  }

  startNextChooserTurn() {
    this.gameSession.rotateChooser()
    return this.getTurnState()
  }

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
