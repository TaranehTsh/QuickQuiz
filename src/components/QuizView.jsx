import { useEffect, useRef, useState } from 'react'

const HINT_WRONG_COUNT = 2

// mix the wrong answers and keep two of them
function pickHintedWrongOptions(question) {
  const wrongOptions = question.options.filter(
    (option) => option !== question.getCorrectAnswer(),
  )

  const copy = [...wrongOptions]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const temp = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = temp
  }

  return copy.slice(0, Math.min(HINT_WRONG_COUNT, copy.length))
}

export default function QuizView({
  activePlayerName,
  category,
  question,
  timeLimit,
  hintUsedThisRound = false,
  onUseHint,
  onSubmitAnswer,
  isFavorite = false,
  onToggleFavorite,
  result, // developer-Hafsa
  hideFeedback = false, // developer-Leon: keep tie-break answers private.
}) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [locked, setLocked] = useState(false) // stop extra clicks after answering
  const timedOutRef = useRef(false)
  // developer-Taraneh
  // red marks only apply to the question where they used the hint
  const [hintedWrongOptions, setHintedWrongOptions] = useState([])
  const hintUsed = hintUsedThisRound || hintedWrongOptions.length > 0

  useEffect(() => {
    if (locked) {
      return undefined
    }

    // developer-Tim
    // check if time already expired when answer submitted (lag check)
    if (timeRemaining <= 0) {
      if (!timedOutRef.current) {
        timedOutRef.current = true
        setLocked(true)
        onSubmitAnswer('', 0) // treat as a missed answer
      }
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setTimeRemaining((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [locked, onSubmitAnswer, timeRemaining])

  function handleAnswer(answer) {
    // hinted answers stay unclickable
    if (locked || timeRemaining <= 0 || hintedWrongOptions.includes(answer)) {
      return
    }

    setLocked(true)
    onSubmitAnswer(answer, timeRemaining)
  }

  // developer-Taraneh
  // one hint per round (this player's 3 questions)
  function handleHint() {
    if (locked || timeRemaining <= 0 || hintUsed) {
      return
    }

    onUseHint?.()
    setHintedWrongOptions(pickHintedWrongOptions(question))
  }

  // developer-Hafsa
  // green = correct, red = the one they picked if wrong
  function getButtonClass(option) {
    if (!result || hideFeedback) return 'answer-button'
    if (option === result.correctAnswer) return 'answer-button correct'
    if (option === result.submittedAnswer) return 'answer-button incorrect'
    return 'answer-button disabled'
  }

  const progress = (timeRemaining / timeLimit) * 100

  return (
    <div
      className="view-panel"
      style={{ '--category-colour': category.getColour() }}
    >
      <div className="quiz-meta">
        <span className="category-label">{category.name}</span>
        {/* developer-Tim */}
        {/* numerical countdown timer display and low time notification */}
        <span className={`timer ${timeRemaining <= 5 ? 'urgent' : ''}`}>
          {timeRemaining}s left
        </span>
      </div>

      <div
        aria-label={`${timeRemaining} seconds remaining`}
        aria-valuemax={timeLimit}
        aria-valuemin="0"
        aria-valuenow={timeRemaining}
        className="timer-track"
        role="progressbar"
      >
        <div 
          // visual countdown bar with low time notification
          className={`timer-fill ${timeRemaining <= 5 ? 'urgent' : ''}`}
          style={{ width: `${progress}%` }} 
          />
      </div>

      <p className="view-kicker">Question for {activePlayerName}</p>
      <h2 className="question-prompt">{question.prompt}</h2>
      <button
        aria-pressed={isFavorite}
        className={`favorite-button${isFavorite ? ' favorite-button--saved' : ''}`}
        onClick={onToggleFavorite}
        type="button"
      >
        <span aria-hidden="true">{isFavorite ? '♥' : '♡'}</span>
        {isFavorite ? 'Saved to favourites' : 'Save to favourites'}
      </button>

      {/* developer-Taraneh */}
      <div className="hint-row">
        <button
          aria-label={hintUsed ? 'Hint already used this round' : 'Use hint'}
          className={`hint-button${hintUsed || locked ? ' hint-button--used' : ''}`}
          disabled={locked || timeRemaining <= 0 || hintUsed}
          onClick={handleHint}
          type="button"
        >
          {hintUsed || locked ? '🔒' : '💡'}
        </button>
        {hintedWrongOptions.length > 0 && (
          <p className="hint-status">
            Two wrong answers are marked red. The correct one is one of the two
            left.
          </p>
        )}
        {hintUsedThisRound && hintedWrongOptions.length === 0 && (
          <p className="hint-status">Hint already used this round.</p>
        )}
      </div>

      <div className="answer-grid">
        {question.options.map((option) => (
          <button
            className={getButtonClass(option)}
            disabled={locked || timeRemaining <= 0 || hintedWrongOptions.includes(option)}
            key={option}
            onClick={() => handleAnswer(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
