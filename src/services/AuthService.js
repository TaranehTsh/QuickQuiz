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
    const exists = users.some(
      (user) => user.email === DEFAULT_ACCOUNT.email,
    )

    let changed = false

    if (!exists) {
      users.push({
        email: DEFAULT_ACCOUNT.email,
        username: DEFAULT_ACCOUNT.username,
        password: this.obfuscate(DEFAULT_ACCOUNT.password),
        quizHistory: [],
        friends: [],
      })

      changed = true
    }

    // developer-Leon
    // Adds a friends list to accounts created before this feature existed.
    users.forEach((user) => {
      if (!Array.isArray(user.friends)) {
        user.friends = []
        changed = true
      }
    })

    if (changed) {
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
      friends: [],
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

    return {
      email: user.email,
      username: user.username,
    }
  }

  setCurrentUser(email) {
    localStorage.setItem(CURRENT_USER_KEY, email)
  }

  getCurrentUser() {
    const email = localStorage.getItem(CURRENT_USER_KEY)

    if (!email) return null

    const users = this.getUsers()

    const user = users.find(
      (candidate) => candidate.email === email,
    )

    return user
      ? {
          email: user.email,
          username: user.username,
        }
      : null
  }

  logOut() {
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  recordQuizResult(email, resultSummary) {
    const users = this.getUsers()

    const user = users.find(
      (candidate) => candidate.email === email,
    )

    if (!user) return

    user.quizHistory = user.quizHistory || []

    user.quizHistory.push({
      ...resultSummary,
      playedAt: new Date().toISOString(),
    })

    this.saveUsers(users)
  }

  getQuizHistory(email) {
    const users = this.getUsers()

    const user = users.find(
      (candidate) => candidate.email === email,
    )

    return user?.quizHistory ?? []
  }

  // developer-Leon
  // Search registered users by username or email.
  searchUsers(currentUserEmail, query) {
    const searchText = query.trim().toLowerCase()

    if (!searchText) {
      return []
    }

    const users = this.getUsers()

    const currentUser = users.find(
      (user) => user.email === currentUserEmail,
    )

    if (!currentUser) {
      return []
    }

    const friends = currentUser.friends ?? []

    return users
      .filter((user) => user.email !== currentUserEmail)
      .filter(
        (user) =>
          user.username.toLowerCase().includes(searchText) ||
          user.email.toLowerCase().includes(searchText),
      )
      .map((user) => ({
        email: user.email,
        username: user.username,
        isFriend: friends.includes(user.email),
      }))
  }

  // developer-Leon
  // Adds a user to the friend list only.
  // This does not affect quiz opponent selection.
  addFriend(currentUserEmail, friendEmail) {
    const users = this.getUsers()

    const currentUser = users.find(
      (user) => user.email === currentUserEmail,
    )

    const friend = users.find(
      (user) => user.email === friendEmail,
    )

    if (!currentUser) {
      throw new Error('Current user could not be found.')
    }

    if (!friend) {
      throw new Error('User could not be found.')
    }

    if (currentUser.email === friend.email) {
      throw new Error('You cannot add yourself as a friend.')
    }

    currentUser.friends = currentUser.friends ?? []

    if (currentUser.friends.includes(friend.email)) {
      throw new Error('This user is already your friend.')
    }

    currentUser.friends.push(friend.email)

    this.saveUsers(users)
  }

  // developer-Leon
  // Returns the current user's saved friends.
  getFriends(email) {
    const users = this.getUsers()

    const currentUser = users.find(
      (user) => user.email === email,
    )

    if (!currentUser) {
      return []
    }

    const friendEmails = currentUser.friends ?? []

    return friendEmails
      .map((friendEmail) =>
        users.find(
          (user) => user.email === friendEmail,
        ),
      )
      .filter(Boolean)
      .map((friend) => ({
        email: friend.email,
        username: friend.username,
      }))
  }
}