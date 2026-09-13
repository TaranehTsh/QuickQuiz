export default function AnswerFeedbackView({
  activePlayerName,
  feedback,
  onContinue,
}) {
  const isCorrect = feedback.isCorrect

  return (
    <div className="feedback-view view-panel" role="status">
      {/* NEW: "feedback-animate" class added — see CSS below for the
          fade/scale-in keyframes. Covers the "Add visual feedback/
          animations" checklist item, which wasn't done yet. */}
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
              The correct answer is <strong>{feedback.correctAnswer}</strong>.
            </div>
          )}
          {isCorrect && <div>One point has been added to your score.</div>}
        </div>

        <button className="primary-button" onClick={onContinue} type="button">
          Continue
        </button>
      </div>
    </div>
  )
}
