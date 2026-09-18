import Challenge from './Challenge.js'

// holds the current 2-player game: whose turn, category, scores
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
    this.activePlayerId = players[0].playerId // who is answering right now
    this.categoryChooserId = players[0].playerId // developer-Taraneh
    this.selectedCategoryId = null
    this.roundState = 'category-selection'
    this.rounds = []
    this.challenges = [] // each challenge = one category, 3 questions each
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

  // developer-Taraneh
  // only the chooser can pick the category for this set
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

  // save this player's 3/3, then either pass to the other player or end the set
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

  // developer-Taraneh
  // other player picks the next category
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

  // developer-Taraneh
  // swap who is answering (also clears the category)
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
