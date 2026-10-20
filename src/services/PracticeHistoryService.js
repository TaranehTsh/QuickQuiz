// developer-Leon: practice saves history without recording a competitive
// win or loss. AuthService's competitive result handling stays separate.
export default function recordPracticeResult(authService, email, score) {
  const users = authService.getUsers()
  const user = users.find((candidate) => candidate.email === email)

  if (!user) return null

  user.quizHistory = user.quizHistory || []
  user.quizHistory.push({
    mode: 'practice',
    score,
    won: false,
    isTie: false,
    playedAt: new Date().toISOString(),
  })

  authService.saveUsers(users)
  return authService.toPublicUser(user)
}
