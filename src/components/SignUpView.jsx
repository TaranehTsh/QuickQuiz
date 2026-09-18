import { useState } from 'react'

// developer-Hafsa
// create an account so quiz history can be saved
export default function SignUpView({ onSignUp, onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()

    try {
      onSignUp({ username, email, password })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="view-panel">
      <div className="view-heading">
        <p className="view-kicker">Get started</p>
        <h2>Create your account</h2>
        <p className="view-description">
          Sign up to save your quiz history to your profile.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          Username
          <input
            onChange={(event) => setUsername(event.target.value)}
            required
            type="text"
            value={username}
          />
        </label>

        <label className="form-field">
          Email
          <input
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="form-field">
          Password
          <input
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button" type="submit">
          Sign up
        </button>
      </form>

      <button className="link-button" onClick={onSwitchToLogin} type="button">
        Already have an account? Log in
      </button>
    </div>
  )
}
