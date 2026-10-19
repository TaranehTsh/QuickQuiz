const USERS_KEY = 'quickquiz_users'
const CURRENT_USER_KEY = 'quickquiz_current_user'

// Sprint 2: questions offered at sign-up, used to prove ownership when
// resetting a password.
export const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What was the name of your first school?',
  'In which city were you born?',
  'What is the name of your favourite teacher?',
  'What was the first game you ever played?',
]

// A shared demo account so any teammate or marker can log in immediately
// without signing up first, since each browser's localStorage starts empty.
// Security answer for testing the password reset: QuickQuiz
const DEFAULT_ACCOUNT = {
  email: 'demo@quickquiz.com',
  username: 'Demo Player',
  password: 'demo123',
  securityQuestion: 'What is the name of this app?',
  securityAnswer: 'QuickQuiz',
}

// NOTE: This is local-only persistence for a Sprint 1 class project —
// not a real backend. Passwords and security answers are lightly obfuscated
// (not encrypted) so they aren't sitting in plain text, but this is NOT
// secure enough for a real production app with real users.

export default class AuthService {
  constructor() {
    this.ensureDefaultAccount()
  }

  ensureDefaultAccount() {
    const users = this.getUsers()
    const existing = users.find((user) => user.email === DEFAULT_ACCOUNT.email)

    if (!existing) {
      users.push({
        email: DEFAULT_ACCOUNT.email,
        username: DEFAULT_ACCOUNT.username,
        password: this.obfuscate(DEFAULT_ACCOUNT.password),
        securityQuestion: DEFAULT_ACCOUNT.securityQuestion,
        securityAnswer: this.obfuscateAnswer(DEFAULT_ACCOUNT.securityAnswer),
        quizHistory: [],
      })
    } else if (!existing.securityQuestion) {
      // The demo account was saved before security questions existed
      existing.securityQuestion = DEFAULT_ACCOUNT.securityQuestion
      existing.securityAnswer = this.obfuscateAnswer(DEFAULT_ACCOUNT.securityAnswer)
    } else {
      return
    }

    this.saveUsers(users)
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

  // Security answers ignore capital letters and extra spaces, and are
  // encoded safely even if they contain non-English characters.
  obfuscateAnswer(answer) {
    const normalised = String(answer ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
    const bytes = new TextEncoder().encode(normalised)
    let binary = ''
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })
    return btoa(binary)
  }

  signUp({ username, email, password, securityQuestion, securityAnswer }) {
    if (!username || !email || !password) {
      throw new Error('Please fill in all fields.')
    }

    if (!securityQuestion || !this.obfuscateAnswer(securityAnswer)) {
      throw new Error('Please choose a security question and answer it.')
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
      securityQuestion,
      securityAnswer: this.obfuscateAnswer(securityAnswer),
      quizHistory: [],
      winStreak: 0,
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
      winStreak: Number(user.winStreak) || 0,
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

  // Sprint 2: password reset (local only - no email is sent).
  // Step 1: find the account and return its security question.
  //   null  -> no account with that email
  //   ''    -> account exists but has no security question
  //   text  -> the question to show
  getSecurityQuestion(email) {
    const wanted = String(email ?? '').trim()
    const user = this.getUsers().find((candidate) => candidate.email === wanted)

    if (!user) return null
    return user.securityQuestion || ''
  }

  accountExists(email) {
    const wanted = String(email ?? '').trim()
    return this.getUsers().some((candidate) => candidate.email === wanted)
  }

  // Step 2: the answer is checked HERE (not just in the screen), so the
  // password only changes when the security answer is correct. Only the
  // password changes, so the username and quiz history stay as they were.
  resetPassword(email, securityAnswer, newPassword) {
    const wanted = String(email ?? '').trim()
    const users = this.getUsers()
    const user = users.find((candidate) => candidate.email === wanted)

    if (!user) {
      throw new Error('No account found with that email.')
    }

    if (!user.securityQuestion || !user.securityAnswer) {
      throw new Error(
        'This account has no security question, so its password cannot be reset. Please sign up again.',
      )
    }

    if (this.obfuscateAnswer(securityAnswer) !== user.securityAnswer) {
      throw new Error('Incorrect answer to the security question.')
    }

    if (!newPassword) {
      throw new Error('Please enter a new password.')
    }

    user.password = this.obfuscate(newPassword)
    this.saveUsers(users)
  }

  recordQuizResult(email, resultSummary) {
    const users = this.getUsers()
    const user = users.find((candidate) => candidate.email === email)
    if (!user) return

    user.quizHistory = user.quizHistory || []
    user.quizHistory.push({ ...resultSummary, playedAt: new Date().toISOString() })

    // developer-Taraneh
    // win streak lives on the account so it stays after log out
    const currentStreak = Number(user.winStreak) || 0
    user.winStreak = resultSummary.won ? currentStreak + 1 : 0

    this.saveUsers(users)
    return this.toPublicUser(user)
  }

  getQuizHistory(email) {
    const users = this.getUsers()
    const user = users.find((candidate) => candidate.email === email)
    return user?.quizHistory ?? []
  }
}