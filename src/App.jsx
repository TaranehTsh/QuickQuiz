import { useState } from 'react'
import './App.css'
import AnswerFeedbackView from './components/AnswerFeedbackView.jsx'
import CategorySelectionView from './components/CategorySelectionView.jsx'
import QuizView from './components/QuizView.jsx'
import ResultsView from './components/ResultsView.jsx'
import SignUpView from './components/SignUpView.jsx'
import LoginView from './components/LoginView.jsx'
import DashboardView from './components/DashboardView.jsx'
import QuizAndTimerController from './controllers/QuizAndTimerController.js'
import TurnAndCategoryController from './controllers/TurnAndCategoryController.js'
import { categoryData } from './data/questions.js'
import {
  CHALLENGES_PER_GAME,
  QUESTIONS_PER_CATEGORY_SET,
  QUESTIONS_PER_PLAYER,
  QUESTION_TIME_LIMIT,
} from './gameConfig.js'
import GameSession from './models/GameSession.js'
import Player from './models/Player.js'
import CategoryQuestionRepository from './repositories/CategoryQuestionRepository.js'
import QuizApiQuestionService from './services/QuizApiQuestionService.js'
import PlayerResults from './services/PlayerResults.js'
import ResultsService from './services/ResultsService.js'
import AuthService from './services/AuthService.js'

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
    questionService: new QuizApiQuestionService(repository),
    resultsService: new ResultsService(
      gameSession,
      playerResults,
      repository,
    ),
  }
}

function App() {
  const [game, setGame] = useState(createGame)
  const [authService] = useState(() => new AuthService())
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser())
  const [view, setView] = useState(() =>
    authService.getCurrentUser() ? 'dashboard' : 'login',
  )
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [challengeOutcome, setChallengeOutcome] = useState(null)
  const [finalResults, setFinalResults] = useState(null)

  const { gameSession } = game
  const activePlayer = gameSession.getActivePlayer()
  const currentRound = gameSession.getCurrentRound()
  const displayedSet = Math.min(
    Math.max(gameSession.challenges.length, 1),
    CHALLENGES_PER_GAME,
  )
  const displayedQuestion =
    currentRound && currentRound.currentQuestionIndex >= 0
      ? currentRound.currentQuestionIndex + 1
      : 1

  const inAuthFlow = view === 'login' || view === 'signup' || view === 'dashboard'

  function handleSignUp(details) {
    const user = authService.signUp(details)
    setCurrentUser(user)
    setView('dashboard')
  }

  function handleLogIn(details) {
    const user = authService.logIn(details)
    setCurrentUser(user)
    setView('dashboard')
  }

  function handleLogOut() {
    authService.logOut()
    setCurrentUser(null)
    setView('login')
  }

  function handleStartQuizFromDashboard() {
    setView('category')
  }

  async function handleCategorySelect(categoryId) {
    const categoryChoice = game.turnController.chooseCategory(
      gameSession.activePlayerId,
      categoryId,
    )

    setSelectedCategory(categoryChoice.category)
    setView('loading')

    const questionSets = await game.questionService.getCategoryQuestionSets(
      categoryChoice.category,
    )
    const question = game.quizController.startChooserTurn(
      categoryId,
      questionSets.chooserQuestions,
      questionSets.opponentQuestions,
    )

    setCurrentQuestion(question)
    setFeedback(null)
    setChallengeOutcome(null)
    setView('quiz')
  }

  function handleAnswerSubmit(answer, timeRemaining) {
    const answerResult = game.quizController.checkAnswer(
      gameSession.activePlayerId,
      answer,
      timeRemaining,
    )

    setFeedback(answerResult)

    window.setTimeout(() => {
      setView('feedback')
    }, 1200)
  }

  function handleContinue() {
    const nextQuestion = game.quizController.continueIfMoreQuestions()

    if (nextQuestion) {
      setCurrentQuestion(nextQuestion)
      setFeedback(null)
      setView('quiz')
      return
    }

    const outcome = game.quizController.finishActivePlayerTurn()
    setChallengeOutcome(outcome)
    setFeedback(null)

    if (!outcome.bothPlayersFinished) {
      setView('handoff')
      return
    }

    setView('challenge-result')
  }

  function handleHandoffContinue() {
    const question = game.quizController.startOpponentTurn()
    setCurrentQuestion(question)
    setFeedback(null)
    setView('quiz')
  }

  function handleChallengeContinue() {
    if (game.quizController.isQuizComplete(CHALLENGES_PER_GAME)) {
      gameSession.finishRound()
      const results = game.resultsService.getFinalResults()
      setFinalResults(results)

      if (currentUser) {
        const me = results.players.find((p) => p.playerId === 'player-1')
        authService.recordQuizResult(currentUser.email, {
          score: me?.score ?? 0,
          won: results.winnerPlayerId === 'player-1',
          isTie: results.isTie,
        })
      }

      setView('results')
      return
    }

    game.turnController.startNextChooserTurn()
    setCurrentQuestion(null)
    setSelectedCategory(null)
    setFeedback(null)
    setChallengeOutcome(null)
    setView('category')
  }

  function handleRestart() {
    setGame(createGame())
    setCurrentQuestion(null)
    setSelectedCategory(null)
    setFeedback(null)
    setChallengeOutcome(null)
    setFinalResults(null)
    setView('dashboard')
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">COMP602 · Sprint 1</p>
          <h1>QuickQuiz</h1>
        </div>

        {!inAuthFlow && (
          <div
            className="round-pill"
            aria-label={`Set ${displayedSet} of ${CHALLENGES_PER_GAME}, question ${displayedQuestion} of ${QUESTIONS_PER_PLAYER}`}
          >
            Set {displayedSet}/{CHALLENGES_PER_GAME} · Q {displayedQuestion}/
            {QUESTIONS_PER_PLAYER}
          </div>
        )}
      </header>

      {!inAuthFlow && (
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
      )}

      <section className="game-stage">
        {view === 'login' && (
          <LoginView onLogIn={handleLogIn} onSwitchToSignUp={() => setView('signup')} />
        )}

        {view === 'signup' && (
          <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setView('login')} />
        )}

        {view === 'dashboard' && currentUser && (
          <DashboardView
            user={currentUser}
            quizHistory={authService.getQuizHistory(currentUser.email)}
            onStartQuiz={handleStartQuizFromDashboard}
            onLogOut={handleLogOut}
          />
        )}

        {view === 'category' && (
          <CategorySelectionView
            activePlayerName={playerNames[activePlayer.playerId]}
            categories={game.repository.getCategories()}
            onSelectCategory={handleCategorySelect}
          />
        )}

        {view === 'loading' && (
          <div className="view-panel">
            <p className="view-kicker">Getting questions</p>
            <h2>
              Loading {QUESTIONS_PER_CATEGORY_SET} {selectedCategory?.name}{' '}
              questions
            </h2>
            <p className="view-description">
              Please wait while the next set of questions is prepared.
            </p>
          </div>
        )}

        {view === 'quiz' && currentQuestion && selectedCategory && (
          <QuizView
            key={`${gameSession.activePlayerId}-${currentQuestion.questionId}`}
            activePlayerName={playerNames[activePlayer.playerId]}
            category={selectedCategory}
            question={currentQuestion}
            timeLimit={QUESTION_TIME_LIMIT}
            onSubmitAnswer={handleAnswerSubmit}
            result={feedback}
          />
        )}

        {view === 'feedback' && feedback && (
          <AnswerFeedbackView
            activePlayerName={playerNames[activePlayer.playerId]}
            feedback={feedback}
            onContinue={handleContinue}
          />
        )}

        {view === 'handoff' && challengeOutcome && (
          <div className="view-panel">
            <p className="view-kicker">Pass the device</p>
            <h2>
              {playerNames[challengeOutcome.nextPlayerId]} plays next
            </h2>
            <p className="view-description">
              Same category, three different questions. Player{' '}
              {playerNames[challengeOutcome.challenge.chooserPlayerId]} scored{' '}
              {challengeOutcome.scores[challengeOutcome.challenge.chooserPlayerId]}
              /{QUESTIONS_PER_PLAYER}.
            </p>
            <button
              className="primary-button"
              onClick={handleHandoffContinue}
              type="button"
            >
              Start {playerNames[challengeOutcome.nextPlayerId]}&apos;s
              questions
            </button>
          </div>
        )}

        {view === 'challenge-result' && challengeOutcome && (
          <div className="view-panel">
            <p className="view-kicker">Set {displayedSet} result</p>
            <h2>
              {challengeOutcome.isTie
                ? 'This set is a tie'
                : `${playerNames[challengeOutcome.winnerId]} wins this set`}
            </h2>
            <p className="view-description">
              {gameSession.players
                .map(
                  (player) =>
                    `${playerNames[player.playerId]}: ${
                      challengeOutcome.scores[player.playerId]
                    }/${QUESTIONS_PER_PLAYER}`,
                )
                .join(' · ')}
            </p>
            <button
              className="primary-button"
              onClick={handleChallengeContinue}
              type="button"
            >
              Continue
            </button>
          </div>
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
