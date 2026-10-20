import test from 'node:test'
import assert from 'node:assert/strict'
import { makeGame } from './helpers.js'
import AuthService from '../services/AuthService.js'
import recordPracticeResult from '../services/PracticeHistoryService.js'

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
  assert.equal(game.results.getFinalResults().players[0].score, 300)
  assert.equal(game.results.getFinalResults().players[0].correctCount, 3)
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

function withTestAccount(run) {
  const originalStorage = globalThis.localStorage
  const entries = new Map()
  globalThis.localStorage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: (key) => entries.delete(key),
  }
  try {
    run(new AuthService(), 'demo@quickquiz.com')
  } finally {
    if (originalStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = originalStorage
  }
}

test('practice saves history and preserves a competitive streak of two', () => {
  withTestAccount((auth, email) => {
    auth.recordQuizResult(email, { mode: 'versus', won: true })
    auth.recordQuizResult(email, { mode: 'versus', won: true })
    const user = recordPracticeResult(auth, email, 300)
    assert.equal(user.winStreak, 2)
    const history = auth.getQuizHistory(email)
    assert.equal(history.length, 3)
    assert.equal(history.at(-1).mode, 'practice')
    assert.equal(history.at(-1).score, 300)
    assert.equal(history.at(-1).won, false)
  })
})

test('practice history and the same streak survive logout and login', () => {
  withTestAccount((auth, email) => {
    auth.recordQuizResult(email, { mode: 'versus', won: true })
    recordPracticeResult(auth, email, 100)
    auth.logOut()
    const user = auth.logIn({ email, password: 'demo123' })
    assert.equal(user.winStreak, 1)
    assert.equal(auth.getQuizHistory(email).at(-1).mode, 'practice')
  })
})

test('a later competitive loss still resets the streak after practice', () => {
  withTestAccount((auth, email) => {
    auth.recordQuizResult(email, { mode: 'versus', won: true })
    recordPracticeResult(auth, email, 100)
    assert.equal(auth.recordQuizResult(email, { mode: 'versus', won: false }).winStreak, 0)
  })
})

test('practice leaves the password and favourites unchanged', () => {
  withTestAccount((auth, email) => {
    auth.toggleFavoriteQuestion(email, { questionId: 'science-1', prompt: 'Saved question', categoryId: 'science', categoryName: 'Science' })
    const before = auth.getUsers().find((user) => user.email === email)
    recordPracticeResult(auth, email, 0)
    const after = auth.getUsers().find((user) => user.email === email)
    assert.equal(after.password, before.password)
    assert.deepEqual(after.favoriteQuestions, before.favoriteQuestions)
    assert.equal(auth.getQuizHistory('unknown@example.test').length, 0)
    assert.equal(recordPracticeResult(auth, 'unknown@example.test', 0), null)
  })
})
