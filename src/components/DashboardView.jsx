import { useState } from 'react'

// developer-Hafsa
// logged-in home screen and past quiz scores
export default function DashboardView({ user, quizHistory, onStartQuiz, onLogOut }) {
  // Sprint 2: ask for confirmation before logging out
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  function handleConfirmLogOut() {
    setShowLogoutConfirm(false)
    onLogOut()
  }

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

      <button
        className="link-button"
        onClick={() => setShowLogoutConfirm(true)}
        type="button"
      >
        Log out
      </button>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div
            aria-labelledby="logout-confirm-title"
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <h3 id="logout-confirm-title">Are you sure you want to log out?</h3>
            <p className="view-description">
              You will need to log in again to see your dashboard.
            </p>
            <div className="modal-actions">
              <button
                className="primary-button"
                onClick={handleConfirmLogOut}
                type="button"
              >
                Yes, log out
              </button>
              <button
                className="secondary-button"
                onClick={() => setShowLogoutConfirm(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
