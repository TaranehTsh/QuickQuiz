import { useState } from 'react'

// developer-Leon
// Friends are a separate social feature.
// They do not affect the quiz or opponent selection.
export default function FriendsSection({
  friends,
  onSearchUsers,
  onAddFriend,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handleSearch(event) {
    event.preventDefault()

    setError('')
    setMessage('')

    const searchResults = onSearchUsers(query)
    setResults(searchResults)

    if (searchResults.length === 0) {
      setMessage('No matching users found.')
    }
  }

  function handleAddFriend(email) {
    try {
      onAddFriend(email)

      setError('')
      setMessage('Friend added successfully.')

      // Refresh results so Add Friend becomes Added.
      setResults(onSearchUsers(query))
    } catch (err) {
      setMessage('')
      setError(err.message)
    }
  }

  return (
    <section className="friends-section">
      <div className="friends-heading">
        <div>
          <p className="view-kicker">Social</p>
          <h3>Friends</h3>
        </div>
      </div>

      <div className="friend-list-area">
        <h4>My Friends</h4>

        {friends.length === 0 ? (
          <p className="view-description">
            You have not added any friends yet.
          </p>
        ) : (
          <ul className="friend-list">
            {friends.map((friend) => (
              <li className="friend-item" key={friend.email}>
                <div>
                  <strong>{friend.username}</strong>
                  <span>{friend.email}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="friend-search-form" onSubmit={handleSearch}>
        <label className="form-field">
          Find a friend
          <input
            type="search"
            placeholder="Search username or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            required
          />
        </label>

        <button className="friend-search-button" type="submit">
          Search
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {message && (
        <p className="friend-message">{message}</p>
      )}

      {results.length > 0 && (
        <div className="friend-results">
          <h4>Search Results</h4>

          <ul className="friend-list">
            {results.map((user) => (
              <li className="friend-result" key={user.email}>
                <div>
                  <strong>{user.username}</strong>
                  <span>{user.email}</span>
                </div>

                <button
                  className="friend-add-button"
                  type="button"
                  disabled={user.isFriend}
                  onClick={() => handleAddFriend(user.email)}
                >
                  {user.isFriend ? 'Added' : 'Add Friend'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}