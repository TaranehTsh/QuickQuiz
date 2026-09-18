// developer-Hafsa
// logged-in home screen and past quiz scores
export default function DashboardView({ user, quizHistory, onStartQuiz, onLogOut }) {
  return (
    <div className="view-panel">
      <div className="view-heading">
        <p className="view-kicker">Welcome back</p>
        <h2>{user.username}&apos;s Dashboard</h2>
      </div>

      <button className="primary-button" onClick={onStartQuiz} type="button">
        Start New Quiz
      </button>

      <div className="quiz-history">
        <h3>Your Quiz History</h3>
        {quizHistory.length === 0 ? (
          <p className="view-description">
            No quizzes played yet — start one above!
          </p>
        ) : (
          <ul className="history-list">
            {quizHistory
              .slice()
              .reverse()
              .map((entry, index) => (
                <li className="history-item" key={index}>
                  <span>{new Date(entry.playedAt).toLocaleDateString()}</span>
                  <span>{entry.score} pts</span>
                  <span>{entry.won ? 'Won' : entry.isTie ? 'Tie' : 'Lost'}</span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <button className="link-button" onClick={onLogOut} type="button">
        Log out
      </button>
    </div>
  )
}
