import test from 'node:test'
import assert from 'node:assert/strict'
import { makeGame, completeNormalGame } from './helpers.js'
import SuddenDeathRound from '../models/SuddenDeathRound.js'

test('T01: a completed tied game requires sudden death', () => {
  const game = makeGame()
  completeNormalGame(game, 2, 2)
  assert.equal(game.session.needsSuddenDeath(2), true)
})

test('T02: only player one correct gives player one the win', () => {
  const game = makeGame()
  const question = game.repository.getCategories()[0].getQuestions()[0]
  const round = new SuddenDeathRound(game.session.players, question)
  round.submitResult('player-1', true)
  round.submitResult('player-2', false)
  assert.deepEqual(round.getOutcome(), { state: 'winner', winnerId: 'player-1' })
})

test('T03: the same result for both players requires another question', () => {
  const game = makeGame()
  const question = game.repository.getCategories()[0].getQuestions()[0]
  const round = new SuddenDeathRound(game.session.players, question)
  round.submitResult('player-1', false)
  round.submitResult('player-2', false)
  assert.deepEqual(round.getOutcome(), { state: 'repeat', winnerId: null })
})

test('waits for both players before declaring a winner', () => {
  const game = makeGame()
  const round = new SuddenDeathRound(game.session.players, game.repository.getQuestion('general'))
  round.submitResult('player-1', true)
  assert.equal(round.getOutcome().state, 'waiting')
})

test('only player two correct gives player two the win', () => {
  const game = makeGame()
  const round = new SuddenDeathRound(game.session.players, game.repository.getQuestion('general'))
  round.submitResult('player-1', false)
  round.submitResult('player-2', true)
  assert.equal(round.getOutcome().winnerId, 'player-2')
})

test('both correct answers require another sudden-death question', () => {
  const game = makeGame()
  const round = new SuddenDeathRound(game.session.players, game.repository.getQuestion('general'))
  round.submitResult('player-1', true)
  round.submitResult('player-2', true)
  assert.equal(round.getOutcome().state, 'repeat')
})

test('a new zero-score game does not start sudden death', () => {
  assert.equal(makeGame().session.needsSuddenDeath(), false)
})

test('a completed game with different scores does not start sudden death', () => {
  const game = makeGame()
  completeNormalGame(game, 4, 2)
  assert.equal(game.session.needsSuddenDeath(), false)
})

test('a duplicate or unknown player result is rejected', () => {
  const game = makeGame()
  const round = new SuddenDeathRound(game.session.players, game.repository.getQuestion('general'))
  assert.throws(() => round.submitResult('unknown', true), /known player/)
  round.submitResult('player-1', true)
  assert.throws(() => round.submitResult('player-1', false), /already answered/)
})

test('the controller completes a tie-break and the results display its winner', () => {
  const game = makeGame()
  completeNormalGame(game)
  const question = game.repository.getQuestion('science')
  game.controller.startSuddenDeath(question)
  game.controller.checkAnswer('player-1', question.correctAnswer, 10)
  assert.equal(game.controller.finishSuddenDeathTurn().state, 'waiting')
  assert.equal(game.session.activePlayerId, 'player-2')
  game.controller.startSuddenDeathTurn()
  game.controller.checkAnswer('player-2', '', 0)
  assert.equal(game.controller.finishSuddenDeathTurn().winnerId, 'player-1')
  const result = game.results.getFinalResults()
  assert.equal(result.winnerPlayerId, 'player-1')
  assert.equal(result.isTie, false)
  assert.equal(result.suddenDeathRounds, 1)
})

test('an unresolved tie-break starts another question and resets answer tracking', () => {
  const game = makeGame()
  completeNormalGame(game)
  game.controller.startSuddenDeath(game.repository.getQuestion('general'))
  for (let player = 0; player < 2; player += 1) {
    game.controller.checkAnswer(game.session.activePlayerId, '', 0)
    const outcome = game.controller.finishSuddenDeathTurn()
    if (outcome.state === 'waiting') game.controller.startSuddenDeathTurn()
  }
  assert.equal(game.session.suddenDeath.getOutcome().state, 'repeat')
  game.controller.startSuddenDeath(game.repository.getQuestion('general'))
  assert.equal(game.session.suddenDeath.roundNumber, 2)
  assert.deepEqual(game.session.suddenDeath.results, {})
})

test('continuing twice cannot submit player one’s answer for player two', () => {
  const game = makeGame()
  completeNormalGame(game)
  const question = game.repository.getQuestion('general')
  game.controller.startSuddenDeath(question)
  game.controller.checkAnswer('player-1', question.correctAnswer, 10)
  game.controller.finishSuddenDeathTurn()

  assert.throws(() => game.controller.finishSuddenDeathTurn(), /active player/)
  assert.deepEqual(game.session.suddenDeath.results, { 'player-1': true })
  assert.equal(game.session.suddenDeath.getOutcome().state, 'waiting')

  game.controller.startSuddenDeathTurn()
  game.controller.checkAnswer('player-2', '', 0)
  assert.equal(game.controller.finishSuddenDeathTurn().winnerId, 'player-1')
})
