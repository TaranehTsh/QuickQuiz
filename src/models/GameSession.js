export default class GameSession {
  constructor(sessionId, players) {
    if (!sessionId) {
      throw new Error('GameSession requires a sessionId.')
    }

    if (!Array.isArray(players) || players.length !== 2) {
      throw new Error('GameSession requires exactly two players.')
    }

    this.sessionId = sessionId
    this.players = [...players]
    this.activePlayerId = players[0].playerId
    this.selectedCategoryId = null
    this.roundState = 'category-selection'
    this.rounds = []
  }

  getPlayer(playerId) {
    const player = this.players.find((item) => item.playerId === playerId)

    if (!player) {
      throw new Error(`Unknown player: ${playerId}`)
    }

    return player
  }

  getActivePlayer() {
    return this.getPlayer(this.activePlayerId)
  }

  selectCategory(categoryId, playerId = this.activePlayerId) {
    if (playerId !== this.activePlayerId) {
      throw new Error('Only the active player can select a category.')
    }

    this.selectedCategoryId = categoryId
    this.roundState = 'question'
  }

  addRound(round) {
    this.rounds.push(round)
  }

  getCurrentRound() {
    return this.rounds.at(-1) ?? null
  }

  alternateActivePlayer() {
    const currentIndex = this.players.findIndex(
      (player) => player.playerId === this.activePlayerId,
    )
    const nextIndex = currentIndex === 0 ? 1 : 0

    this.activePlayerId = this.players[nextIndex].playerId
    this.selectedCategoryId = null
    this.roundState = 'category-selection'
  }

  finishRound() {
    this.roundState = 'completed'
  }
}
