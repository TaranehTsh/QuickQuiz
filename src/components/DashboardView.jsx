import { useState } from 'react'

// developer-Hafsa
// logged-in home screen and past quiz scores
export default function DashboardView({
  user,
  quizHistory,
  friends,
  onSearchUsers,
  onAddFriend,
  onStartQuiz,
  onLogOut,
}) {
  // developer-Leon
  const [friendSearch, setFriendSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [friendMessage, setFriendMessage] = useState('')
  const [friendError, setFriendError] = useState('')

  function handleSearch(event) {
    event.preventDefault()

    setFriendMessage('')
    setFriendError('')

    const results = onSearchUsers(friendSearch)

    setSearchResults(results)

    if (results.length === 0) {
      setFriendMessage('No matching users found.')
    }
  }

  function handleAddFriend(email) {
    try {
      onAddFriend(email)

      setFriendError('')
      setFriendMessage('Friend added successfully.')

      // Refresh the results so the button becomes "Added".
      setSearchResults(onSearchUsers(friendSearch))
    } catch (error) {
      setFriendMessage('')
      setFriendError(error.message)
    }
  }

  return (
    <div className="view-panel">
      <div className="view-heading">
        <p className="view-kicker">Welcome back</p>
        <h2>{user.username}&apos;s Dashboard</h2>
      </div>

      {/* Existing game button remains independent from friends. */}
      <button
        className="primary-button"
        onClick={onStartQuiz}
        type="button"
      >
        Start New Quiz
      </button>

      {/* developer-Leon */}
      {/* Add Friends User Story */}
      <div className="quiz-history">
        <h3>Friends</h3>

        {friends.length === 0 ? (
          <p className="view-description">
            You have not added any friends yet.
          </p>
        ) : (
          <ul className="history-list">
            {friends.map((friend) => (
              <li
                className="history-item"
                key={friend.email}
              >
                <span>{friend.username}</span>
                <span>{friend.email}</span>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSearch}>
          <label className="form-field">
            Find a friend
            <input
              type="search"
              placeholder="Username or email"
              value={friendSearch}
              onChange={(event) =>
                setFriendSearch(event.target.value)
              }
              required
            />
          </label>

          <button
            className="primary-button"
            type="submit"
          >
            Search
          </button>
        </form>

        {friendError && (
          <p className="form-error">
            {friendError}
          </p>
        )}

        {friendMessage && (
          <p className="view-description">
            {friendMessage}
          </p>
        )}

        {searchResults.length > 0 && (
          <>
            <h3>Search Results</h3>

            <ul className="history-list">
              {searchResults.map((result) => (
                <li
                  className="history-item"
                  key={result.email}
                >
                  <span>
                    {result.username}
                    <br />
                    {result.email}
                  </span>

                  <button
                    className="link-button"
                    type="button"
                    disabled={result.isFriend}
                    onClick={() =>
                      handleAddFriend(result.email)
                    }
                  >
                    {result.isFriend
                      ? 'Added'
                      : 'Add Friend'}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

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
                <li
                  className="history-item"
                  key={index}
                >
                  <span>
                    {new Date(
                      entry.playedAt,
                    ).toLocaleDateString()}
                  </span>

                  <span>
                    {entry.score} pts
                  </span>

                  <span>
                    {entry.won
                      ? 'Won'
                      : entry.isTie
                        ? 'Tie'
                        : 'Lost'}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <button
        className="link-button"
        onClick={onLogOut}
        type="button"
      >
        Log out
      </button>
    </div>
  )
}