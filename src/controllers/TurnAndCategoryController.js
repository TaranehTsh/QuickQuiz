export default class TurnAndCategoryController {
  constructor(gameSession, repository) {
    this.gameSession = gameSession
    this.repository = repository
  }

  chooseCategory(playerId, categoryId) {
    const category = this.repository.getCategory(categoryId)
    this.gameSession.selectCategory(categoryId, playerId)

    return {
      playerId,
      categoryId,
      colour: category.getColour(),
      category,
    }
  }

  alternateActivePlayer() {
    this.gameSession.alternateActivePlayer()
    return this.gameSession.activePlayerId
  }

  getTurnState() {
    return {
      activePlayerId: this.gameSession.activePlayerId,
      selectedCategoryId: this.gameSession.selectedCategoryId,
      roundState: this.gameSession.roundState,
    }
  }
}
