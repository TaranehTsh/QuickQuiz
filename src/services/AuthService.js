const USERS_KEY = 'quickquiz_users'
const CURRENT_USER_KEY = 'quickquiz_current_user'

// A shared demo account so any teammate or marker can log in immediately
// without signing up first, since each browser's localStorage starts empty.
const DEFAULT_ACCOUNT = {
  email: 'demo@quickquiz.com',
  username: 'Demo Player',
  password: 'demo123',
}

// NOTE: This is local-only persistence for a Sprint 1 class project —
// not a real backend. Passwords are lightly obfuscated (not encrypted)
// so they aren't sitting in plain text, but this is NOT secure enough
// for a real production app with real users.

export default class AuthService {
  constructor() {
    this.ensureDefaultAccount()
  }

  ensureDefaultAccount() {
    const users = this.getUsers()
    const exists = users.some((user) => user.email === DEFAULT_ACCOUNT.email)

    if (!exists) {
      users.push({
        email: DEFAULT_ACCOUNT.email,
        username: DEFAULT_ACCOUNT.username,
        password: this.obfuscate(DEFAULT_ACCOUNT.password),
        quizHistory: [],
      })
      this.saveUsers(users)
    }
  }

  getUsers() {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  }

  saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  obfuscate(password) {
    return btoa(password)
  }

  signUp({ username, email, password }) {
    if (!username || !email || !password) {
      throw new Error('Please fill in all fields.')
    }

    const users = this.getUsers()
    const existing = users.find((user) => user.email === email)

    if (existing) {
      throw new Error('An account with this email already exists.')
    }

    const newUser = {
      email,
      username,
      password: this.obfuscate(password),
      quizHistory: [],
    }

    users.push(newUser)
    this.saveUsers(users)
    this.setCurrentUser(email)

    return this.toPublicUser(newUser)
  }

  logIn({ email, password }) {
    const users = this.getUsers()
    const user = users.find(
      (candidate) =>
        candidate.email === email &&
        candidate.password === this.obfuscate(password),
    )

    if (!user) {
      throw new Error('Incorrect email or password.')
    }

    this.setCurrentUser(email)
    return this.toPublicUser(user)
  }

  setCurrentUser(email) {
    localStorage.setItem(CURRENT_USER_KEY, email)
  }

  getCurrentUser() {
    const email = localStorage.getItem(CURRENT_USER_KEY)
    if (!email) return null

    const users = this.getUsers()
    const user = users.find((candidate) => candidate.email === email)
    return user ? this.toPublicUser(user) : null
  }

  // developer-Taraneh
  toPublicUser(user) {
    return {
      email: user.email,
      username: user.username,
      hasSeenInstructions: Boolean(user.hasSeenInstructions),
    }
  }

  markInstructionsSeen(email) {
    const users = this.getUsers()
    const user = users.find((candidate) => candidate.email === email)

    if (!user) {
      return null
    }

    user.hasSeenInstructions = true
    this.saveUsers(users)
    return this.toPublicUser(user)
  }

  logOut() {
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  // Sprint 2: change the display name of an existing account.
  // Rejects an empty (or spaces-only) username and leaves the saved name unchanged.
  updateUsername(email, newUsername) {
    const trimmed = String(newUsername ?? '').trim()

    if (!trimmed) {
      throw new Error('Username cannot be empty.')
    }

    const users = this.getUsers()
    const user = users.find((candidate) => candidate.email === email)

    if (!user) {
      throw new Error('Account not found.')
    }

    user.username = trimmed
    this.saveUsers(users)

    return this.toPublicUser(user)
  }

  recordQuizResult(email, resultSummary) {
    const users = this.getUsers()
    const user = users.find((candidate) => candidate.email === email)
    if (!user) return

    user.quizHistory = user.quizHistory || []
    user.quizHistory.push({ ...resultSummary, playedAt: new Date().toISOString() })
    this.saveUsers(users)
  }

  getQuizHistory(email) {
    const users = this.getUsers()
    const user = users.find((candidate) => candidate.email === email)
    return user?.quizHistory ?? []
  }
}