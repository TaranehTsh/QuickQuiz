import { useState } from 'react'
import './App.css'
import AnswerFeedbackView from './components/AnswerFeedbackView.jsx'
import CategorySelectionView from './components/CategorySelectionView.jsx'
import QuizView from './components/QuizView.jsx'
import ResultsView from './components/ResultsView.jsx'
import QuizAndTimerController from './controllers/QuizAndTimerController.js'
import TurnAndCategoryController from './controllers/TurnAndCategoryController.js'
import { categoryData } from './data/questions.js'
import GameSession from './models/GameSession.js'
import Player from './models/Player.js'
import CategoryQuestionRepository from './repositories/CategoryQuestionRepository.js'
import PlayerResults from './services/PlayerResults.js'
import ResultsService from './services/ResultsService.js'

const TOTAL_ROUNDS = 4
const QUESTION_TIME_LIMIT = 15

const playerNames = {
  'player-1': 'Player 1',
  'player-2': 'Player 2',
}

function createGame() {
  const players = [new Player('player-1'), new Player('player-2')]
  const gameSession = new GameSession(`session-${Date.now()}`, players)
  const repository = new CategoryQuestionRepository(categoryData)
  const playerResults = new PlayerResults()

  return {
    gameSession,
    repository,
    turnController: new TurnAndCategoryController(gameSession, repository),
    quizController: new QuizAndTimerController(
      gameSession,
      repository,
      playerResults,
      QUESTION_TIME_LIMIT,
    ),
    resultsService: new ResultsService(
      gameSession,
      playerResults,
      repository,
    ),
  }
}

function App() {
  const [game, setGame] = useState(createGame)
  const [view, setView] = useState('category')
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [finalResults, setFinalResults] = useState(null)

  const { gameSession } = game
  const activePlayer = gameSession.getActivePlayer()

  function handleCategorySelect(categoryId) {
    const categoryChoice = game.turnController.chooseCategory(
      gameSession.activePlayerId,
      categoryId,
    )
    const question = game.quizController.startRound(categoryId)

    setSelectedCategory(categoryChoice.category)
    setCurrentQuestion(question)
    setFeedback(null)
    setView('quiz')
  }

  function handleAnswerSubmit(answer, timeRemaining) {
    const answerResult = game.quizController.checkAnswer(
      gameSession.activePlayerId,
      answer,
      timeRemaining,
    )

    setFeedback(answerResult)
    setView('feedback')
  }

  function handleContinue() {
    if (game.quizController.isQuizComplete(TOTAL_ROUNDS)) {
      gameSession.finishRound()
      setFinalResults(game.resultsService.getFinalResults())
      setView('results')
      return
    }

    game.turnController.alternateActivePlayer()
    setCurrentQuestion(null)
    setSelectedCategory(null)
    setFeedback(null)
    setView('category')
  }

  function handleRestart() {
    setGame(createGame())
    setCurrentQuestion(null)
    setSelectedCategory(null)
    setFeedback(null)
    setFinalResults(null)
    setView('category')
  }

  const displayedRound = Math.min(gameSession.rounds.length + 1, TOTAL_ROUNDS)

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">COMP602 · Sprint 1</p>
          <h1>QuickQuiz</h1>
        </div>

        <div
          className="round-pill"
          aria-label={`Round ${displayedRound} of ${TOTAL_ROUNDS}`}
        >
          Round {displayedRound}/{TOTAL_ROUNDS}
        </div>
      </header>

      <section className="score-strip" aria-label="Current scores">
        {gameSession.players.map((player) => (
          <article
            className={`player-score ${
              player.playerId === gameSession.activePlayerId && view !== 'results'
                ? 'active'
                : ''
            }`}
            key={player.playerId}
          >
            <span>{playerNames[player.playerId]}</span>
            <strong>{player.getScore()}</strong>
          </article>
        ))}
      </section>

      <section className="game-stage">
        {view === 'category' && (
          <CategorySelectionView
            activePlayerName={playerNames[activePlayer.playerId]}
            categories={game.repository.getCategories()}
            onSelectCategory={handleCategorySelect}
          />
        )}

        {view === 'quiz' && currentQuestion && selectedCategory && (
          <QuizView
            activePlayerName={playerNames[activePlayer.playerId]}
            category={selectedCategory}
            question={currentQuestion}
            timeLimit={QUESTION_TIME_LIMIT}
            onSubmitAnswer={handleAnswerSubmit}
          />
        )}

        {view === 'feedback' && feedback && (
          <AnswerFeedbackView
            activePlayerName={playerNames[activePlayer.playerId]}
            feedback={feedback}
            onContinue={handleContinue}
          />
        )}

        {view === 'results' && finalResults && (
          <ResultsView
            results={finalResults}
            playerNames={playerNames}
            onRestart={handleRestart}
          />
        )}
      </section>
    </main>
  )
}

export default App
