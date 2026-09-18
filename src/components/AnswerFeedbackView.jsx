import { useState } from 'react'

const FLAG_WORD_LIMIT = 40

function countWords(text) {
  const trimmed = text.trim()
  if (!trimmed) {
    return 0
  }

  return trimmed.split(/\s+/).length
}

// developer-Hafsa
// correct / incorrect card, and shows the right answer if they missed it
export default function AnswerFeedbackView({
  activePlayerName,
  feedback,
  onContinue,
  alreadyFlagged,
  onFlagQuestion,
}) {
  const isCorrect = feedback.isCorrect
  const [showFlagForm, setShowFlagForm] = useState(false)
  const [flagText, setFlagText] = useState('')
  const [flagError, setFlagError] = useState(null)

  const wordCount = countWords(flagText)
  const overLimit = wordCount > FLAG_WORD_LIMIT

  function handleOpenFlag() {
    if (alreadyFlagged) {
      return
    }

    setShowFlagForm(true)
    setFlagError(null)
  }

  function handleSubmitFlag(event) {
    event.preventDefault()

    if (alreadyFlagged) {
      setFlagError('This question has already been reported.')
      return
    }

    if (wordCount === 0) {
      setFlagError('Please describe the issue.')
      return
    }

    if (overLimit) {
      setFlagError(`Please keep it to ${FLAG_WORD_LIMIT} words.`)
      return
    }

    onFlagQuestion(flagText.trim())
    setShowFlagForm(false)
    setFlagText('')
    setFlagError(null)
  }

  return (
    <div className="feedback-view view-panel" role="status">
      {/* developer-Hafsa */}
      <div className={`feedback-card feedback-animate ${isCorrect ? 'correct' : 'incorrect'}`}>
        <span className="feedback-icon" aria-hidden="true">
          {isCorrect ? '✓' : '×'}
        </span>
        <p className="view-kicker">{activePlayerName}</p>
        <h2>{isCorrect ? 'Correct answer!' : 'Not quite'}</h2>

        <div className="feedback-detail">
          {feedback.timedOut && <div>Time ran out.</div>}
          {!isCorrect && (
            <div>
              {/* developer-Hafsa */}
              The correct answer is <strong>{feedback.correctAnswer}</strong>.
            </div>
          )}
          {isCorrect && (
            <div>
              One point has been added to your score. The answer is{' '}
              <strong>{feedback.correctAnswer}</strong>.
            </div>
          )}
        </div>

        {/* developer-Taraneh */}
        <div className="flag-row">
          {alreadyFlagged ? (
            <p className="flag-status">This question has already been reported.</p>
          ) : (
            <button className="link-button" onClick={handleOpenFlag} type="button">
              Flag this question
            </button>
          )}
        </div>

        <button className="primary-button" onClick={onContinue} type="button">
          Continue
        </button>
      </div>

      {/* developer-Taraneh */}
      {showFlagForm && (
        <div className="flag-overlay">
          <form className="flag-dialog" onSubmit={handleSubmitFlag}>
            <h3>Report a problem</h3>
            <p>What is wrong with this question?</p>
            <textarea
              maxLength={400}
              onChange={(event) => {
                setFlagText(event.target.value)
                setFlagError(null)
              }}
              placeholder="Describe the issue"
              rows="4"
              value={flagText}
            />
            <p className={`flag-count ${overLimit ? 'over' : ''}`}>
              {wordCount}/{FLAG_WORD_LIMIT} words
            </p>
            {flagError && <p className="form-error">{flagError}</p>}
            <div className="flag-actions">
              <button
                className="link-button"
                onClick={() => setShowFlagForm(false)}
                type="button"
              >
                Cancel
              </button>
              <button className="primary-button" type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
