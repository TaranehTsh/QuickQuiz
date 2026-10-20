import test from 'node:test'
import assert from 'node:assert/strict'
import GameSession from '../models/GameSession.js'
import Player from '../models/Player.js'
import createGame from '../createGame.js'
import { makeGame } from './helpers.js'

test('the normal game still requires two players', () => {
  assert.equal(makeGame().session.players.length, 2)
  assert.throws(() => new GameSession('one', [new Player('player-1')]), /exactly 2/)
})

test('unknown game modes and invalid practice player counts are rejected', () => {
  assert.throws(() => new GameSession('bad', [], 'unknown'), /Unknown game mode/)
  assert.throws(() => new GameSession('bad', [new Player('1'), new Player('2')], 'practice'), /exactly 1/)
})

test('category colours remain distinct and consistent', () => {
  const game = makeGame()
  const categories = game.repository.getCategories()
  assert.equal(new Set(categories.map((category) => category.getColour())).size, categories.length)
  assert.equal(game.repository.getCategory('science').getColour(), game.repository.getCategory('science').getColour())
})

test('normal turns still hand off and rotate the category chooser', () => {
  const game = makeGame()
  const questions = game.repository.getQuestionSet('general', 6)
  game.session.selectCategory('general')
  game.controller.startChooserTurn('general', questions.slice(0, 3), questions.slice(3))
  for (const question of questions.slice(0, 3)) {
    game.controller.checkAnswer('player-1', question.correctAnswer, 10)
    game.controller.continueIfMoreQuestions()
  }
  assert.equal(game.controller.finishActivePlayerTurn().nextPlayerId, 'player-2')
  game.controller.startOpponentTurn()
  for (const question of questions.slice(3)) {
    game.controller.checkAnswer('player-2', question.correctAnswer, 10)
    game.controller.continueIfMoreQuestions()
  }
  assert.equal(game.controller.finishActivePlayerTurn().bothPlayersFinished, true)
  game.session.rotateChooser()
  assert.equal(game.session.categoryChooserId, 'player-2')
})

test('an answer can be recorded only once and the other player cannot submit', () => {
  const game = makeGame('practice')
  const questions = game.repository.getQuestionSet('general', 3)
  game.controller.startPractice('general', questions)
  assert.throws(() => game.controller.checkAnswer('player-2', questions[0].correctAnswer, 10), /active player/)
  game.controller.checkAnswer('player-1', questions[0].correctAnswer, 10)
  assert.throws(() => game.controller.checkAnswer('player-1', questions[0].correctAnswer, 10), /already been answered/)
  assert.equal(game.session.players[0].score, 100)
  assert.equal(game.session.players[0].correctCount, 1)
})

test('a new game resets scores and keeps the requested player count', () => {
  const oldGame = createGame('practice')
  oldGame.gameSession.players[0].recordAnswer(true)
  const next = createGame('versus')
  assert.equal(next.gameSession.players.length, 2)
  assert.equal(next.gameSession.players[0].score, 0)
  assert.equal(next.gameSession.suddenDeath, null)
})

test('local questions remain available if the question API fails', async () => {
  const game = createGame()
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('Offline test') }
  try {
    const sets = await game.questionService.getCategoryQuestionSets(game.repository.getCategory('science'))
    assert.equal(sets.chooserQuestions.length, 3)
    assert.equal(sets.opponentQuestions.length, 3)
    assert.ok(sets.chooserQuestions.every((question) => question.categoryId === 'science'))
  } finally {
    globalThis.fetch = originalFetch
  }
})
