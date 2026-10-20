import { useState } from 'react'
import { SECURITY_QUESTIONS } from '../services/AuthService.js'

// developer-Hafsa
// create an account so quiz history can be saved
export default function SignUpView({ onSignUp, onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Sprint 2: used to prove it's really you when resetting a password
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [error, setError] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()

    try {
      onSignUp({ username, email, password, securityQuestion, securityAnswer })
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

        <label className="form-field">
          Security question
          <select
            onChange={(event) => setSecurityQuestion(event.target.value)}
            required
            value={securityQuestion}
          >
            <option disabled value="">
              Choose a question
            </option>
            {SECURITY_QUESTIONS.map((question) => (
              <option key={question} value={question}>
                {question}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          Your answer
          <input
            onChange={(event) => setSecurityAnswer(event.target.value)}
            required
            type="text"
            value={securityAnswer}
          />
        </label>
        <p className="view-description">
          You will need this answer if you ever forget your password.
        </p>

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
