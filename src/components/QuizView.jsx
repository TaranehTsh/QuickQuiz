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
  onSubmitAnswer,
  result, // developer-Hafsa
}) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [locked, setLocked] = useState(false) // stop extra clicks after answering
  const timedOutRef = useRef(false)
  // developer-Taraneh
  // which wrong answers the hint has marked red
  const [hintedWrongOptions, setHintedWrongOptions] = useState([])
  const hintUsed = hintedWrongOptions.length > 0 // one hint per question

  useEffect(() => {
    if (locked) {
      return undefined
    }

    // developer-Tim
    // check if time already expired when answer submitted (lag check)
    if (timeRemaining <= 0) {
      if (!timedOutRef.current) {
        timedOutRef.current = true
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
    if (locked || hintedWrongOptions.includes(answer)) {
      return
    }

    setLocked(true)
    onSubmitAnswer(answer, timeRemaining)
  }

  // developer-Taraneh
  // one hint per question — two wrong answers go red, not the right one
  function handleHint() {
    if (locked || hintUsed) {
      return
    }

    setHintedWrongOptions(pickHintedWrongOptions(question))
  }

  // developer-Hafsa
  // green = correct, red = the one they picked if wrong
  function getButtonClass(option) {
    if (result) {
      if (option === result.correctAnswer) return 'answer-button correct'
      if (option === result.submittedAnswer) return 'answer-button incorrect'
      return 'answer-button disabled'
    }

    // red = hint crossed this one out
    if (hintedWrongOptions.includes(option)) {
      return 'answer-button hint-wrong'
    }

    return 'answer-button'
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

      {/* developer-Taraneh */}
      <div className="hint-row">
        <button
          className="secondary-button hint-button"
          disabled={locked || hintUsed}
          onClick={handleHint}
          type="button"
        >
          Hint
        </button>
        {hintUsed && (
          <p className="hint-status">
            Two wrong answers are marked red. The correct one is one of the two
            left.
          </p>
        )}
      </div>

      <div className="answer-grid">
        {question.options.map((option) => (
          <button
            className={getButtonClass(option)}
            disabled={locked || hintedWrongOptions.includes(option)}
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
