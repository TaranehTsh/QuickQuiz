// developer-Leon: both players answer one question before a winner is decided.
export default class SuddenDeathRound {
  constructor(players, question, roundNumber = 1) {
    if (players.length !== 2 || !question) {
      throw new Error('Sudden death requires two players and a question.')
    }
    this.playerIds = players.map((player) => player.playerId)
    if (new Set(this.playerIds).size !== 2) {
      throw new Error('Sudden death requires two different player IDs.')
    }
    this.question = question
    this.roundNumber = roundNumber
    this.results = {}
  }

  submitResult(playerId, isCorrect) {
    if (!this.playerIds.includes(playerId) || typeof isCorrect !== 'boolean') {
      throw new Error('A known player and a boolean result are required.')
    }
    if (Object.hasOwn(this.results, playerId)) {
      throw new Error('This player has already answered.')
    }
    this.results[playerId] = isCorrect
  }

  getNextPlayerId() {
    return this.playerIds.find((id) => !Object.hasOwn(this.results, id)) ?? null
  }

  getOutcome() {
    const [first, second] = this.playerIds
    if (Object.hasOwn(this.results, first) && Object.hasOwn(this.results, second)) {
      if (this.results[first] === this.results[second]) {
        return { state: 'repeat', winnerId: null }
      }
      return { state: 'winner', winnerId: this.results[first] ? first : second }
    }
    return { state: 'waiting', winnerId: null }
  }
}
