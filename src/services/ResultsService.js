export default class ResultsService {
  constructor(gameSession, playerResults, repository) {
    this.gameSession = gameSession
    this.playerResults = playerResults
    this.repository = repository
  }

  getFinalResults() {
    // developer-Will
    const players = this.gameSession.players.map((player) => ({
      playerId: player.playerId,
      score: player.getScore(),
      challengeWins: player.challengeWins,
      ...this.playerResults.getStatistics(player.playerId, this.repository), // developer-Tim
    }))

    const highestScore = Math.max(...players.map((player) => player.score))
    const winners = players.filter((player) => player.score === highestScore)

    return {
      players,
      isTie: winners.length > 1,
      winnerPlayerId: winners.length === 1 ? winners[0].playerId : null, // developer-Will
      challengeResults: this.gameSession.challenges.map((challenge) => ({
        challengeNumber: challenge.challengeNumber,
        categoryId: challenge.categoryId,
        scores: { ...challenge.playerScores },
        winnerPlayerId: challenge.getWinnerId(),
      })),
    }
  }
}
