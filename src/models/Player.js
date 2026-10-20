// one player's score for the current quiz
export default class Player {
  constructor(playerId) {
    if (!playerId) {
      throw new Error('Player requires a playerId.')
    }

    this.playerId = playerId
    this.score = 0 // developer-Will
    this.correctCount = 0
    this.incorrectCount = 0
    this.challengeWins = 0
  }

  recordAnswer(isCorrect, elapsedSeconds = 0) {
    if (isCorrect) {
      const pointsAwarded = Math.max(0, 150 - elapsedSeconds * 10)
      this.score += pointsAwarded
      this.correctCount += 1
      return pointsAwarded
    }

    this.incorrectCount += 1
    return 0
  }

  recordChallengeWin() {
    this.challengeWins += 1
  }

  // developer-Will
  getScore() {
    return this.score
  }
}
