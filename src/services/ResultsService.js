export default class ResultsService {
  constructor(gameSession, playerResults, repository) {
    this.gameSession = gameSession
    this.playerResults = playerResults
    this.repository = repository
  }

  getFinalResults() {
    const players = this.gameSession.players.map((player) => ({
      playerId: player.playerId,
      score: player.getScore(),
      ...this.playerResults.getStatistics(player.playerId, this.repository),
    }))

    const highestScore = Math.max(...players.map((player) => player.score))
    const winners = players.filter((player) => player.score === highestScore)

    return {
      players,
      isTie: winners.length > 1,
      winnerPlayerId: winners.length === 1 ? winners[0].playerId : null,
    }
  }
}
