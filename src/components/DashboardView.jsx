import { useState } from 'react'
import HowToPlayView from './HowToPlayView.jsx'

// developer-Hafsa
// logged-in home screen and past quiz scores
export default function DashboardView({
  user,
  quizHistory,
  onStartQuiz,
  onLogOut,
  onUpdateUsername,
  onInstructionsSeen,
}) {
  // Sprint 2: ask for confirmation before logging out
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  // developer-Taraneh
  // new players see How to play the first time they open the dashboard
  const [showHowToPlay, setShowHowToPlay] = useState(!user.hasSeenInstructions)

  // Sprint 2: edit username
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [usernameInput, setUsernameInput] = useState(user.username)
  const [usernameError, setUsernameError] = useState(null)

  function handleConfirmLogOut() {
    setShowLogoutConfirm(false)
    onLogOut()
  }

  function handleStartEditing() {
    setUsernameInput(user.username)
    setUsernameError(null)
    setIsEditingUsername(true)
  }

  function handleCancelEditing() {
    setUsernameError(null)
    setIsEditingUsername(false)
  }

  function handleSaveUsername(event) {
    event.preventDefault()

    // Empty (or spaces-only) names are rejected and nothing is saved
    if (!usernameInput.trim()) {
      setUsernameError('Username cannot be empty.')
      return
    }

    try {
      onUpdateUsername(usernameInput)
      setUsernameError(null)
      setIsEditingUsername(false)
    } catch (err) {
      setUsernameError(err.message)
    }
  }

  return (
    <div className="view-panel">
      <div className="view-heading">
        <div className="dashboard-heading-row">
          <div>
            <p className="view-kicker">Welcome back</p>
            <h2>{user.username}&apos;s Dashboard</h2>
          </div>
          {/* developer-Taraneh */}
          <button
            aria-label="How to play"
            className="help-icon-button"
            onClick={() => setShowHowToPlay(true)}
            title="How to play"
            type="button"
          >
            ?
          </button>
        </div>

        {isEditingUsername ? (
          <form className="edit-username-form" onSubmit={handleSaveUsername}>
            <label className="form-field">
              New username
              <input
                maxLength={30}
                onChange={(event) => setUsernameInput(event.target.value)}
                type="text"
                value={usernameInput}
              />
            </label>

            {usernameError && <p className="form-error">{usernameError}</p>}

            <div className="edit-username-actions">
              <button className="primary-button" type="submit">
                Save
              </button>
              <button
                className="secondary-button"
                onClick={handleCancelEditing}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            className="link-button"
            onClick={handleStartEditing}
            type="button"
          >
            Edit username
          </button>
        )}
      </div>

      <button className="primary-button" onClick={onStartQuiz} type="button">
        Start New Quiz
      </button>

      {/* developer-Taraneh */}
      <p className="win-streak" aria-label={`Win streak ${user.winStreak || 0}`}>
        Win streak: <strong>{user.winStreak || 0}</strong>
      </p>

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

      {showHowToPlay && (
        <HowToPlayView
          onClose={() => {
            setShowHowToPlay(false)
            onInstructionsSeen?.()
          }}
        />
      )}

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
