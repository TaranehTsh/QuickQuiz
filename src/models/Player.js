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

  recordAnswer(isCorrect) {
    if (isCorrect) {
      this.score += 1 // +1 point
      this.correctCount += 1
      return
    }

    this.incorrectCount += 1
  }

  recordChallengeWin() {
    this.challengeWins += 1
  }

  // developer-Will
  getScore() {
    return this.score
  }
}
