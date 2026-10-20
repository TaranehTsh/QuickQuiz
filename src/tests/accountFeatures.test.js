import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import AuthService from '../services/AuthService.js'

const email = 'demo@quickquiz.com'
const question = { questionId: 'science-1', prompt: 'A saved question', categoryId: 'science', categoryName: 'Science', correctAnswer: 'Private answer', options: ['Private answer', 'Wrong'] }

beforeEach(() => {
  const items = new Map()
  globalThis.localStorage = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
  }
})

test('a competitive win increases the saved streak once per recorded game', () => {
  const auth = new AuthService()
  assert.equal(auth.recordQuizResult(email, { mode: 'versus', won: true }).winStreak, 1)
  assert.equal(auth.recordQuizResult(email, { mode: 'versus', won: true }).winStreak, 2)
})

for (const [label, result] of [['loss', { mode: 'versus', won: false }], ['tie', { mode: 'versus', won: false, isTie: true }]]) {
  test(`a competitive ${label} resets a streak of two`, () => {
    const auth = new AuthService()
    auth.recordQuizResult(email, { mode: 'versus', won: true })
    auth.recordQuizResult(email, { mode: 'versus', won: true })
    assert.equal(auth.recordQuizResult(email, result).winStreak, 0)
  })
}

test('solo practice records history without resetting a competitive win streak', () => {
  const auth = new AuthService()
  auth.recordQuizResult(email, { mode: 'versus', won: true })
  auth.recordQuizResult(email, { mode: 'versus', won: true })
  assert.equal(auth.recordQuizResult(email, { mode: 'practice', won: false, score: 100 }).winStreak, 2)
  assert.equal(auth.getQuizHistory(email).at(-1).mode, 'practice')
})

test('streak, favourites and history persist across logout and login', () => {
  const auth = new AuthService()
  auth.recordQuizResult(email, { mode: 'versus', won: true })
  auth.toggleFavoriteQuestion(email, question)
  auth.logOut()
  assert.equal(auth.getCurrentUser(), null)
  const user = new AuthService().logIn({ email, password: 'demo123' })
  assert.equal(user.winStreak, 1)
  assert.equal(auth.getFavoriteQuestions(email).length, 1)
  assert.equal(auth.getQuizHistory(email).length, 1)
})

test('saving a favourite lists its prompt and category without exposing the answer', () => {
  const auth = new AuthService()
  auth.toggleFavoriteQuestion(email, question)
  assert.deepEqual(auth.getFavoriteQuestions(email), [{ questionId: question.questionId, prompt: question.prompt, categoryId: question.categoryId, categoryName: question.categoryName }])
})

test('saving several favourites lists all questions and supports toggle and remove', () => {
  const auth = new AuthService()
  auth.toggleFavoriteQuestion(email, question)
  auth.toggleFavoriteQuestion(email, { ...question, questionId: 'science-2' })
  assert.equal(auth.getFavoriteQuestions(email).length, 2)
  auth.toggleFavoriteQuestion(email, question)
  assert.equal(auth.getFavoriteQuestions(email).length, 1)
  auth.removeFavoriteQuestion(email, 'science-2')
  assert.deepEqual(auth.getFavoriteQuestions(email), [])
})

test('favourites are isolated between accounts', () => {
  const auth = new AuthService()
  auth.signUp({ username: 'Second tester', email: 'second@example.test', password: 'test123', securityQuestion: 'First pet?', securityAnswer: 'Cat' })
  auth.toggleFavoriteQuestion(email, question)
  assert.deepEqual(auth.getFavoriteQuestions('second@example.test'), [])
})

test('username and password changes retain streak, history and favourites', () => {
  const auth = new AuthService()
  auth.recordQuizResult(email, { mode: 'versus', won: true })
  auth.toggleFavoriteQuestion(email, question)
  assert.equal(auth.updateUsername(email, 'Updated tester').username, 'Updated tester')
  assert.throws(() => auth.resetPassword(email, 'wrong answer', 'newpass123'), /Incorrect answer/)
  auth.resetPassword(email, 'quickquiz', 'newpass123')
  const user = auth.logIn({ email, password: 'newpass123' })
  assert.equal(user.winStreak, 1)
  assert.equal(user.username, 'Updated tester')
  assert.equal(auth.getQuizHistory(email).length, 1)
  assert.equal(auth.getFavoriteQuestions(email).length, 1)
})

test('legacy results without a mode still update the competitive streak', () => {
  const auth = new AuthService()
  assert.equal(auth.recordQuizResult(email, { won: true }).winStreak, 1)
  assert.equal(auth.recordQuizResult(email, { won: false }).winStreak, 0)
})
