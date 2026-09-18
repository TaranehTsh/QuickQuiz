import { QUESTIONS_PER_PLAYER } from '../gameConfig.js'

// developer-Taraneh
export default class Challenge {
  constructor(
    challengeNumber,
    categoryId,
    chooserPlayerId,
    opponentPlayerId,
    chooserQuestions,
    opponentQuestions,
  ) {
    if (
      !Array.isArray(chooserQuestions) ||
      chooserQuestions.length !== QUESTIONS_PER_PLAYER
    ) {
      throw new Error(
        `Challenge requires ${QUESTIONS_PER_PLAYER} questions for the chooser.`,
      )
    }

    if (
      !Array.isArray(opponentQuestions) ||
      opponentQuestions.length !== QUESTIONS_PER_PLAYER
    ) {
      throw new Error(
        `Challenge requires ${QUESTIONS_PER_PLAYER} questions for the opponent.`,
      )
    }

    this.challengeNumber = challengeNumber
    this.categoryId = categoryId
    this.chooserPlayerId = chooserPlayerId
    this.opponentPlayerId = opponentPlayerId
    this.chooserQuestions = [...chooserQuestions]
    this.opponentQuestions = [...opponentQuestions]
    this.playerScores = {
      [chooserPlayerId]: 0,
      [opponentPlayerId]: 0,
    }
    this.completedPlayerIds = []
  }

  getQuestionsForPlayer(playerId) {
    if (playerId === this.chooserPlayerId) {
      return [...this.chooserQuestions]
    }

    if (playerId === this.opponentPlayerId) {
      return [...this.opponentQuestions]
    }

    throw new Error(`Player ${playerId} is not part of this challenge.`)
  }

  recordPlayerResult(playerId, correctCount) {
    if (!Object.hasOwn(this.playerScores, playerId)) {
      throw new Error(`Player ${playerId} is not part of this challenge.`)
    }

    this.playerScores[playerId] = correctCount

    if (!this.completedPlayerIds.includes(playerId)) {
      this.completedPlayerIds.push(playerId)
    }
  }

  bothPlayersComplete() {
    return this.completedPlayerIds.length >= 2
  }

  getNextPlayerId() {
    if (!this.completedPlayerIds.includes(this.chooserPlayerId)) {
      return this.chooserPlayerId
    }

    return this.opponentPlayerId
  }

  getWinnerId() {
    const chooserScore = this.playerScores[this.chooserPlayerId]
    const opponentScore = this.playerScores[this.opponentPlayerId]

    if (chooserScore === opponentScore) {
      return null
    }

    return chooserScore > opponentScore
      ? this.chooserPlayerId
      : this.opponentPlayerId
  }
}
