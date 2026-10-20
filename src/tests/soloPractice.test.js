import test from 'node:test'
import assert from 'node:assert/strict'
import { makeGame } from './helpers.js'

test('S01: practice creates a game with only the current player', () => {
  const game = makeGame('practice')
  assert.equal(game.session.mode, 'practice')
  assert.equal(game.session.players.length, 1)
  assert.equal(game.session.activePlayerId, 'player-1')
})

test('S02: practice loads the chosen category with the normal timer', () => {
  const game = makeGame('practice')
  const questions = game.repository.getCategory('science').getQuestions().slice(0, 3)
  const first = game.controller.startPractice('science', questions)
  assert.equal(first, questions[0])
  assert.equal(game.session.selectedCategoryId, 'science')
  assert.equal(game.session.getCurrentRound().timeLimitSeconds, 15)
})

test('S03: a completed practice shows a personal result without a handoff', () => {
  const game = makeGame('practice')
  const questions = game.repository.getCategory('science').getQuestions().slice(0, 3)
  game.controller.startPractice('science', questions)
  for (const question of questions) {
    game.controller.checkAnswer('player-1', question.correctAnswer, 10)
    game.controller.continueIfMoreQuestions()
  }
  const outcome = game.controller.finishActivePlayerTurn()
  assert.equal(outcome.practiceComplete, true)
  assert.equal(game.session.roundState, 'completed')
  assert.equal(game.results.getFinalResults().players[0].score, 3)
})

test('practice never needs sudden death', () => {
  assert.equal(makeGame('practice').session.needsSuddenDeath(), false)
})

test('practice results have no opponent, winner or tie', () => {
  const result = makeGame('practice').results.getFinalResults()
  assert.equal(result.mode, 'practice')
  assert.equal(result.players.length, 1)
  assert.equal(result.winnerPlayerId, null)
  assert.equal(result.isTie, false)
})

test('a timed-out practice answer receives no points', () => {
  const game = makeGame('practice')
  const questions = game.repository.getQuestionSet('general', 3)
  game.controller.startPractice('general', questions)
  const result = game.controller.checkAnswer('player-1', questions[0].correctAnswer, 0)
  assert.equal(result.timedOut, true)
  assert.equal(result.isCorrect, false)
  assert.equal(game.session.players[0].score, 0)
})

test('cannot finish practice before all questions have been answered', () => {
  const game = makeGame('practice')
  game.controller.startPractice('general', game.repository.getQuestionSet('general', 3))
  assert.throws(() => game.controller.finishActivePlayerTurn(), /all questions/)
})

test('a versus session cannot use the practice entry point', () => {
  const game = makeGame()
  assert.throws(() => game.controller.startPractice('general', game.repository.getQuestionSet('general', 3)), /single-player/)
})
