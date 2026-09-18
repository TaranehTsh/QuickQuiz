import { useState } from 'react'

// developer-Hafsa
export default function LoginView({ onLogIn, onSwitchToSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  function handleSubmit(event) {
    event.preventDefault() // stay on this page, don't reload

    try {
      onLogIn({ email, password })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="view-panel">
      <div className="view-heading">
        <p className="view-kicker">Welcome back</p>
        <h2>Log in</h2>
        <p className="view-description">
          Log in to see your saved quiz history.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
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
          Log in
        </button>
      </form>

      <button className="link-button" onClick={onSwitchToSignUp} type="button">
        Don&apos;t have an account? Sign up
      </button>
    </div>
  )
}
