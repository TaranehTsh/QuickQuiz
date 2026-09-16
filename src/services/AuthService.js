const USERS_KEY = 'quickquiz_users'
const CURRENT_USER_KEY = 'quickquiz_current_user'

// NOTE: This is local-only persistence for a Sprint 1 class project —
// not a real backend. Passwords are lightly obfuscated (not encrypted)
// so they aren't sitting in plain text, but this is NOT secure enough
// for a real production app with real users.

export default class AuthService {
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

    return { email, username }
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
    return { email: user.email, username: user.username }
  }

  setCurrentUser(email) {
    localStorage.setItem(CURRENT_USER_KEY, email)
  }

  getCurrentUser() {
    const email = localStorage.getItem(CURRENT_USER_KEY)
    if (!email) return null

    const users = this.getUsers()
    const user = users.find((candidate) => candidate.email === email)
    return user ? { email: user.email, username: user.username } : null
  }

  logOut() {
    localStorage.removeItem(CURRENT_USER_KEY)
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