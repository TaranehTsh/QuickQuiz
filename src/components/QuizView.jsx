import { useEffect, useRef, useState } from 'react'

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

  useEffect(() => {
    if (locked) {
      return undefined
    }

    // developer-Tim
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
    if (locked) {
      return
    }

    setLocked(true)
    onSubmitAnswer(answer, timeRemaining)
  }

  // developer-Hafsa
  // green = correct, red = the one they picked if wrong
  function getButtonClass(option) {
    if (!result) return 'answer-button'
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
          className={`timer-fill ${timeRemaining <= 5 ? 'urgent' : ''}`}
          style={{ width: `${progress}%` }} 
          />
      </div>

      <p className="view-kicker">Question for {activePlayerName}</p>
      <h2 className="question-prompt">{question.prompt}</h2>

      <div className="answer-grid">
        {question.options.map((option) => (
          <button
            className={getButtonClass(option)}
            disabled={locked}
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
