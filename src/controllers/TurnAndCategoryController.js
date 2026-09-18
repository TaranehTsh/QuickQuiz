export default class TurnAndCategoryController {
  constructor(gameSession, repository) {
    this.gameSession = gameSession
    this.repository = repository
  }

  chooseCategory(playerId, categoryId) {
    if (playerId !== this.gameSession.categoryChooserId) {
      throw new Error('Only the category chooser can select a category.')
    }

    if (this.gameSession.getUsedCategoryIds().has(categoryId)) { // this checks if the category was already picked before
      throw new Error( // this stops the same category from being picked twice
        `Category ${categoryId} has already been played this game.`,
      )
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
