import { useRef, useState } from 'react'
import './App.css'
import AnswerFeedbackView from './components/AnswerFeedbackView.jsx'
import CategorySelectionView from './components/CategorySelectionView.jsx'
import QuizView from './components/QuizView.jsx'
import ResultsView from './components/ResultsView.jsx'
import SignUpView from './components/SignUpView.jsx'
import LoginView from './components/LoginView.jsx'
import DashboardView from './components/DashboardView.jsx'
import createGame from './createGame.js'
import {
  CHALLENGES_PER_GAME,
  QUESTIONS_PER_CATEGORY_SET,
  QUESTIONS_PER_PLAYER,
  QUESTION_TIME_LIMIT,
} from './gameConfig.js'
import AuthService from './services/AuthService.js'

const playerNames = {
  'player-1': 'Player 1',
  'player-2': 'Player 2',
}

function App() {
  const [game, setGame] = useState(createGame)
  // developer-Hafsa
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
  // developer-Taraneh
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState([])
  const [loadError, setLoadError] = useState('')
  const loadRequest = useRef(0)

  const { gameSession } = game
  const hideSuddenDeathScores = gameSession.suddenDeath?.getOutcome().state === 'waiting'
  const activePlayer = gameSession.getActivePlayer()
  const currentRound = gameSession.getCurrentRound()
  // header: which set and which question (1/3) we are on
  const displayedSet = Math.min(
    Math.max(gameSession.challenges.length, 1),
    CHALLENGES_PER_GAME,
  )
  const displayedQuestion =
    currentRound && currentRound.currentQuestionIndex >= 0
      ? currentRound.currentQuestionIndex + 1
      : 1

  const inAuthFlow = view === 'login' || view === 'signup' || view === 'dashboard'

  // developer-Hafsa
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

  // developer-Leon: start each mode with fresh scores and state.
  function resetGame(mode = 'versus') {
    loadRequest.current += 1
    setGame(createGame(mode))
    setCurrentQuestion(null)
    setSelectedCategory(null)
    setFeedback(null)
    setChallengeOutcome(null)
    setFinalResults(null)
    setFlaggedQuestionIds([])
    setLoadError('')
  }

  function handleStartQuizFromDashboard(mode = 'versus') {
    resetGame(mode)
    setView('category')
  }

  async function handleCategorySelect(categoryId) {
    const requestId = ++loadRequest.current
    setLoadError('')
    try {
      const categoryChoice = game.turnController.chooseCategory(
        gameSession.activePlayerId, categoryId,
      )
      setSelectedCategory(categoryChoice.category)
      setView('loading')
      const questionSets = await game.questionService.getCategoryQuestionSets(categoryChoice.category)
      if (requestId !== loadRequest.current) return
      const question = gameSession.mode === 'practice'
        ? game.quizController.startPractice(categoryId, questionSets.chooserQuestions)
        : game.quizController.startChooserTurn(categoryId, questionSets.chooserQuestions, questionSets.opponentQuestions)
      setCurrentQuestion(question)
      setFeedback(null)
      setChallengeOutcome(null)
      setView('quiz')
    } catch (error) {
      if (requestId !== loadRequest.current) return
      setLoadError(error.message || 'Unable to load questions. Please try again.')
      setView('category')
    }
  }

  function finishGame() {
    gameSession.finishRound()
    const results = game.resultsService.getFinalResults()
    setFinalResults(results)
    if (currentUser) {
      const me = results.players.find((player) => player.playerId === 'player-1')
      authService.recordQuizResult(currentUser.email, {
        mode: results.mode,
        score: me?.score ?? 0,
        won: results.mode === 'versus' && results.winnerPlayerId === 'player-1',
        isTie: results.isTie,
      })
    }
    setView('results')
  }

  function handleStartSuddenDeath() {
    try {
      const category = selectedCategory || game.repository.getCategories()[0]
      const question = game.repository.getQuestion(category.categoryId)
      setSelectedCategory(category)
      setCurrentQuestion(game.quizController.startSuddenDeath(question))
      setFeedback(null)
      setLoadError('')
      setView('quiz')
    } catch (error) {
      setLoadError(error.message)
    }
  }

  function handleSuddenDeathContinue() {
    const outcome = game.quizController.finishSuddenDeathTurn()
    setFeedback(null)
    if (outcome.state === 'waiting') {
      setView('sudden-death-handoff')
    } else if (outcome.state === 'repeat') {
      setView('sudden-death-repeat')
    } else {
      finishGame()
    }
  }

  function handleAnswerSubmit(answer, timeRemaining) {
    const answerResult = game.quizController.checkAnswer(
      gameSession.activePlayerId,
      answer,
      timeRemaining,
    )

    setFeedback(answerResult)
    if (gameSession.suddenDeath) {
      // Keep the answer private until the other player has answered.
      setView('sudden-death-saved')
      return
    }

    // developer-Hafsa
    window.setTimeout(() => {
      setView('feedback')
    }, 1200)
  }

  function handleContinue() {
    const nextQuestion = game.quizController.continueIfMoreQuestions()

    // still on this player's 3 questions
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion)
      setFeedback(null)
      setView('quiz')
      return
    }

    const outcome = game.quizController.finishActivePlayerTurn()
    if (outcome.practiceComplete) {
      setFeedback(null)
      finishGame()
      return
    }
    setChallengeOutcome(outcome)
    setFeedback(null)

    if (!outcome.bothPlayersFinished) {
      // developer-Taraneh
      // other player still needs to answer their 3
      setView('handoff')
      return
    }

    setView('challenge-result')
  }

  function handleHandoffContinue() {
    // start the second player's 3 questions (same category, different set)
    const question = gameSession.suddenDeath
      ? game.quizController.startSuddenDeathTurn()
      : game.quizController.startOpponentTurn()
    setCurrentQuestion(question)
    setFeedback(null)
    setView('quiz')
  }

  function handleChallengeContinue() {
    // after 2 sets, show final results; otherwise the other player picks
    if (game.quizController.isQuizComplete(CHALLENGES_PER_GAME)) {
      if (gameSession.needsSuddenDeath(CHALLENGES_PER_GAME)) {
        handleStartSuddenDeath()
      } else {
        finishGame()
      }
      return
    }

    // developer-Taraneh
    game.turnController.startNextChooserTurn()
    setCurrentQuestion(null)
    setSelectedCategory(null)
    setFeedback(null)
    setChallengeOutcome(null)
    setView('category')
  }

  function handleRestart() {
    resetGame()
    setView(currentUser ? 'dashboard' : 'login')
  }

  // developer-Taraneh
  function handleFlagQuestion(questionId) {
    if (!questionId || flaggedQuestionIds.includes(questionId)) {
      return
    }

    setFlaggedQuestionIds([...flaggedQuestionIds, questionId])
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">COMP602 · Sprint 2</p>
          <h1>QuickQuiz</h1>
        </div>

        {!inAuthFlow && (
          <div className="round-pill" aria-label="Game progress">
            {gameSession.mode === 'practice'
              ? `Practice · Q ${displayedQuestion}/${QUESTIONS_PER_PLAYER}`
              : gameSession.suddenDeath
                ? `Sudden death ${gameSession.suddenDeath.roundNumber}`
                : `Set ${displayedSet}/${CHALLENGES_PER_GAME} · Q ${displayedQuestion}/${QUESTIONS_PER_PLAYER}`}
          </div>
        )}
      </header>

      {/* developer-Will */}
      {!inAuthFlow && (
        <section className={`score-strip ${gameSession.mode === 'practice' ? 'score-strip--practice' : ''}`} aria-label="Current scores">
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
              <strong className={hideSuddenDeathScores ? 'score-hidden' : undefined}>
                {hideSuddenDeathScores ? 'Hidden' : player.getScore()}
              </strong>
            </article>
          ))}
        </section>
      )}

      <section className="game-stage">
        {loadError && <p className="view-description" role="alert">{loadError}</p>}
        {/* developer-Hafsa */}
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
            onStartQuiz={() => handleStartQuizFromDashboard('versus')}
            onStartPractice={() => handleStartQuizFromDashboard('practice')}
            onLogOut={handleLogOut}
          />
        )}

        {/* developer-Leon / developer-Taraneh */}
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
              Loading {gameSession.mode === 'practice' ? QUESTIONS_PER_PLAYER : QUESTIONS_PER_CATEGORY_SET} {selectedCategory?.name}{' '}
              questions
            </h2>
            <p className="view-description">
              Please wait while the next set of questions is prepared.
            </p>
          </div>
        )}

        {/* developer-Tim */}
        {view === 'quiz' && currentQuestion && selectedCategory && (
          <QuizView
            // remount so the timer resets for each question
            key={`${gameSession.activePlayerId}-${currentQuestion.questionId}-${currentRound?.roundNumber}`}
            hideFeedback={Boolean(gameSession.suddenDeath)}
            activePlayerName={playerNames[activePlayer.playerId]}
            category={selectedCategory}
            question={currentQuestion}
            timeLimit={QUESTION_TIME_LIMIT}
            onSubmitAnswer={handleAnswerSubmit}
            result={feedback}
          />
        )}

        {/* developer-Hafsa */}
        {view === 'feedback' && feedback && (
          <AnswerFeedbackView
            activePlayerName={playerNames[activePlayer.playerId]}
            alreadyFlagged={flaggedQuestionIds.includes(
              feedback.answerRecord?.questionId,
            )}
            feedback={feedback}
            onContinue={handleContinue}
            onFlagQuestion={() =>
              handleFlagQuestion(feedback.answerRecord?.questionId)
            }
          />
        )}

        {/* pass the device to the other player */}
        {view === 'handoff' && challengeOutcome && (
          <div className="view-panel">
            <p className="view-kicker">Pass the device</p>
            <h2>
              {playerNames[challengeOutcome.nextPlayerId]} plays next
            </h2>
            <p className="view-description">
              Same category, three different questions.{' '}
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

        {/* who won this category set */}
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

        {view === 'sudden-death-saved' && (
          <div className="view-panel">
            <p className="view-kicker">Sudden death</p>
            <h2>Answer saved</h2>
            <p className="view-description">Answers and scores stay hidden until both players have answered.</p>
            <button className="primary-button" onClick={handleSuddenDeathContinue} type="button">Continue</button>
          </div>
        )}

        {view === 'sudden-death-handoff' && (
          <div className="view-panel">
            <p className="view-kicker">Pass the device</p>
            <h2>{playerNames[gameSession.activePlayerId]} plays next</h2>
            <p className="view-description">Answer the same sudden-death question. Each player gets {QUESTION_TIME_LIMIT} seconds.</p>
            <button className="primary-button" onClick={handleHandoffContinue} type="button">Start sudden-death question</button>
          </div>
        )}

        {view === 'sudden-death-repeat' && (
          <div className="view-panel">
            <p className="view-kicker">Sudden death</p>
            <h2>Still tied — one more question</h2>
            <p className="view-description">Both players had the same result. Correct answer: {gameSession.suddenDeath.question.correctAnswer}</p>
            <button className="primary-button" onClick={handleStartSuddenDeath} type="button">Next sudden-death question</button>
          </div>
        )}

        {/* developer-Will / developer-Tim */}
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
