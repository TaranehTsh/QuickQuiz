import Challenge from './Challenge.js'

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
    this.categoryChooserId = players[0].playerId 
    this.selectedCategoryId = null
    this.roundState = 'category-selection'
    this.rounds = []
    this.challenges = []
    this.currentChallenge = null
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

  getOpponentId(playerId) {
    const opponent = this.players.find((player) => player.playerId !== playerId)

    if (!opponent) {
      throw new Error('GameSession requires an opponent.')
    }

    return opponent.playerId
  }

  selectCategory(categoryId, playerId = this.activePlayerId) {
    if (playerId !== this.categoryChooserId) {
      throw new Error('Only the category chooser can select a category.')
    }

    this.selectedCategoryId = categoryId
    this.roundState = 'question'
  }

  startChallenge(challenge) {
    if (!(challenge instanceof Challenge)) {
      throw new Error('GameSession.startChallenge requires a Challenge.')
    }

    this.currentChallenge = challenge
    this.challenges.push(challenge)
    this.activePlayerId = challenge.chooserPlayerId
    this.selectedCategoryId = challenge.categoryId
    this.roundState = 'question'
  }

  addRound(round) {
    this.rounds.push(round)
  }

  getCurrentRound() {
    return this.rounds.at(-1) ?? null
  }

  getUsedCategoryIds() { // this is a new method
    return new Set(this.challenges.map((challenge) => challenge.categoryId)) // this grabs the category from every challenge played so far and puts them in a set so there are no repeats
  }

  completePlayerTurn(playerId, correctCount) {
    const challenge = this.currentChallenge

    if (!challenge) {
      throw new Error('There is no active challenge.')
    }

    challenge.recordPlayerResult(playerId, correctCount)

    if (challenge.bothPlayersComplete()) {
      const winnerId = challenge.getWinnerId()

      if (winnerId) {
        this.getPlayer(winnerId).recordChallengeWin()
      }

      this.roundState = 'challenge-result'

      return {
        bothPlayersFinished: true,
        winnerId,
        isTie: winnerId === null,
        scores: { ...challenge.playerScores },
        challenge,
      }
    }

    this.activePlayerId = challenge.getNextPlayerId()
    this.roundState = 'handoff'

    return {
      bothPlayersFinished: false,
      nextPlayerId: this.activePlayerId,
      scores: { ...challenge.playerScores },
      challenge,
    }
  }

  rotateChooser() {
    this.categoryChooserId = this.getOpponentId(this.categoryChooserId)
    this.activePlayerId = this.categoryChooserId
    this.selectedCategoryId = null
    this.currentChallenge = null
    this.roundState = 'category-selection'
  }

  isGameComplete(totalChallenges) {
    const lastChallenge = this.challenges.at(-1)

    return (
      this.challenges.length >= totalChallenges &&
      Boolean(lastChallenge?.bothPlayersComplete())
    )
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
