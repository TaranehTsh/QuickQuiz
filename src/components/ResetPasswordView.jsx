import { useState } from 'react'

// developer-Hafsa
// Sprint 2: reset a forgotten password.
// Local only - the app has no backend or email, so ownership is checked
// with the security question chosen at sign-up.
export default function ResetPasswordView({
  onFindAccount,
  onResetPassword,
  onBackToLogin,
}) {
  // 'email' -> 'password' -> 'done'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)

  function handleEmailSubmit(event) {
    event.preventDefault()

    // null = no account, '' = account without a security question
    const foundQuestion = onFindAccount(email)

    if (foundQuestion === null) {
      setError('No account found with that email.')
      return
    }

    if (!foundQuestion) {
      setError(
        'This account has no security question, so its password cannot be reset. Please sign up again.',
      )
      return
    }

    setQuestion(foundQuestion)
    setError(null)
    setStep('password')
  }

  function handlePasswordSubmit(event) {
    event.preventDefault()

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      // The answer is checked again inside the reset itself
      onResetPassword(email, answer, newPassword)
      setError(null)
      setStep('done')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="view-panel">
      <div className="view-heading">
        <p className="view-kicker">Account help</p>
        <h2>Reset your password</h2>
      </div>

      {step === 'email' && (
        <>
          <p className="view-description">
            Enter the email you signed up with.
          </p>
          <form className="auth-form" onSubmit={handleEmailSubmit}>
            <label className="form-field">
              Email
              <input
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="primary-button" type="submit">
              Continue
            </button>
          </form>
        </>
      )}

      {step === 'password' && (
        <>
          <p className="view-description">
            Answer your security question to reset the password for{' '}
            <strong>{email.trim()}</strong>.
          </p>
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <p className="security-question">
              <strong>{question}</strong>
            </p>

            <label className="form-field">
              Your answer
              <input
                onChange={(event) => setAnswer(event.target.value)}
                required
                type="text"
                value={answer}
              />
            </label>

            <label className="form-field">
              New password
              <input
                onChange={(event) => setNewPassword(event.target.value)}
                required
                type="password"
                value={newPassword}
              />
            </label>

            <label className="form-field">
              Confirm new password
              <input
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="primary-button" type="submit">
              Reset password
            </button>
          </form>
        </>
      )}

      {step === 'done' && (
        <>
          <p className="form-success" role="status">
            Your password has been reset. Your quiz history is still saved.
          </p>
          <button className="primary-button" onClick={onBackToLogin} type="button">
            Back to log in
          </button>
        </>
      )}

      {step !== 'done' && (
        <button className="link-button" onClick={onBackToLogin} type="button">
          Back to log in
        </button>
      )}
    </div>
  )
}
