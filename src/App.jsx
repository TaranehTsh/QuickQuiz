import { useState } from 'react'
import './App.css'
import AnswerFeedbackView from './components/AnswerFeedbackView.jsx'
import CategorySelectionView from './components/CategorySelectionView.jsx'
import QuizView from './components/QuizView.jsx'
import ResultsView from './components/ResultsView.jsx'
import SignUpView from './components/SignUpView.jsx'
import LoginView from './components/LoginView.jsx'
import ResetPasswordView from './components/ResetPasswordView.jsx'
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
// developer-Will
// these are the two sound files, the happy one and the sad one
import correctSoundUrl from './assets/audio/Correct.mp3'
import incorrectSoundUrl from './assets/audio/Incorrect.mp3'
import SoundEffectService from './services/SoundEffectService.js'

const playerNames = {
  'player-1': 'Player 1',
  'player-2': 'Player 2',
}

function getChallengePoints(gameSession, challenge, playerId) {
  const questionIds = new Set(
    challenge
      .getQuestionsForPlayer(playerId)
      .map((question) => question.questionId),
  )

  return gameSession.rounds
    .filter((round) => round.playerId === playerId)
    .flatMap((round) => round.answerRecords)
    .filter((answerRecord) => questionIds.has(answerRecord.questionId))
    .reduce((total, answerRecord) => total + answerRecord.pointsAwarded, 0)
}

// builds a fresh 2-player game
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
  // developer-Will
  // this holds the sound player, we make it one time and keep it
  const [soundEffects] = useState(
    () =>
      new SoundEffectService({
        correctUrl: correctSoundUrl,
        incorrectUrl: incorrectSoundUrl,
      }),
  )

  const { gameSession } = game
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

  const inAuthFlow =
   view === 'login' ||
   view === 'signup' ||
   view === 'dashboard' ||
   view === 'reset-password'

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

  function handleUpdateUsername(newUsername) {
    const updatedUser = authService.updateUsername(
      currentUser.email,
      newUsername,
    )
    setCurrentUser(updatedUser)
  }


  function handleFindAccount(email) {
    return authService.getSecurityQuestion(email)
  }
 
  function handleResetPassword(email, securityAnswer, newPassword) {
    authService.resetPassword(email, securityAnswer, newPassword)
  }

  // developer-Taraneh
  function handleInstructionsSeen() {
    if (!currentUser) {
      return
    }

    const updatedUser = authService.markInstructionsSeen(currentUser.email)
    if (updatedUser) {
      setCurrentUser(updatedUser)
    }
  }

  function handleToggleFavoriteQuestion(question) {
    const updatedUser = authService.toggleFavoriteQuestion(
      currentUser.email,
      {
        questionId: question.questionId,
        prompt: question.prompt,
        categoryId: question.categoryId,
        categoryName: selectedCategory.name,
      },
    )
    setCurrentUser(updatedUser)
  }

  function handleRemoveFavoriteQuestion(questionId) {
    const updatedUser = authService.removeFavoriteQuestion(
      currentUser.email,
      questionId,
    )
    setCurrentUser(updatedUser)
  }

  function handleStartQuizFromDashboard() {
    setView('category')
  }

  // developer-Taraneh
  // player picks a category, then we load 6 questions (3 each)
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

  // developer-Will
  // player wants a surprise, so we pick a category by luck
  function handleRandomCategorySelect() {
    // ask the controller to pick one category for us
    const randomCategoryId = game.turnController.pickRandomCategoryId()

    // now do the very same steps as when a player taps a category button
    // so the questions come from the category that was picked
    handleCategorySelect(randomCategoryId)
  }

  function handleAnswerSubmit(answer, timeRemaining) {
    const answerResult = game.quizController.checkAnswer(
      gameSession.activePlayerId,
      answer,
      timeRemaining,
    )

    // developer-Will
    // right answer plays the happy sound
    // wrong answer, or no time left, plays the sad sound
    soundEffects.playAnswerSound(answerResult.isCorrect)

    setFeedback(answerResult)

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
    const question = game.quizController.startOpponentTurn()
    setCurrentQuestion(question)
    setFeedback(null)
    setView('quiz')
  }

  function handleChallengeContinue() {
    // after 2 sets, show final results; otherwise the other player picks
    if (game.quizController.isQuizComplete(CHALLENGES_PER_GAME)) {
      gameSession.finishRound()
      const results = game.resultsService.getFinalResults()
      setFinalResults(results)

      // developer-Hafsa
      if (currentUser) {
        const me = results.players.find((p) => p.playerId === 'player-1')
        const updatedUser = authService.recordQuizResult(currentUser.email, {
          score: me?.score ?? 0,
          won: results.winnerPlayerId === 'player-1',
          isTie: results.isTie,
        })
        // developer-Taraneh
        if (updatedUser) {
          setCurrentUser(updatedUser)
        }
      }

      setView('results')
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
    setGame(createGame())
    setCurrentQuestion(null)
    setSelectedCategory(null)
    setFeedback(null)
    setChallengeOutcome(null)
    setFinalResults(null)
    setFlaggedQuestionIds([])
    setView('dashboard')
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

      {/* developer-Will */}
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
        {/* developer-Hafsa */}
                 {view === 'login' && (
             <LoginView
               onLogIn={handleLogIn}
               onSwitchToSignUp={() => setView('signup')}
               onForgotPassword={() => setView('reset-password')}
             />
           )}

           {view === 'reset-password' && (
             <ResetPasswordView
               onFindAccount={handleFindAccount}
               onResetPassword={handleResetPassword}
               onBackToLogin={() => setView('login')}
             />
           )}
        {view === 'signup' && (
          <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setView('login')} />
        )}

        {view === 'dashboard' && currentUser && (
          <DashboardView
            user={currentUser}
            quizHistory={authService.getQuizHistory(currentUser.email)}
            favoriteQuestions={authService.getFavoriteQuestions(currentUser.email)}
            onStartQuiz={handleStartQuizFromDashboard}
            onLogOut={handleLogOut}
            onUpdateUsername={handleUpdateUsername}
            onInstructionsSeen={handleInstructionsSeen}
            onRemoveFavoriteQuestion={handleRemoveFavoriteQuestion}
          />
        )}

        {/* developer-Leon / developer-Taraneh */}
        {view === 'category' && (
          <CategorySelectionView
            activePlayerName={playerNames[activePlayer.playerId]}
            categories={game.repository.getCategories()}
            onSelectCategory={handleCategorySelect}
            onSelectRandomCategory={handleRandomCategorySelect}
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

        {/* developer-Tim */}
        {view === 'quiz' && currentQuestion && selectedCategory && (
          <QuizView
            // remount so the timer resets for each question
            key={`${gameSession.activePlayerId}-${currentQuestion.questionId}`}
            activePlayerName={playerNames[activePlayer.playerId]}
            category={selectedCategory}
            hintUsedThisRound={Boolean(currentRound?.hintUsed)}
            onUseHint={() => currentRound?.useHint()}
            question={currentQuestion}
            timeLimit={QUESTION_TIME_LIMIT}
            onSubmitAnswer={handleAnswerSubmit}
            result={feedback}
            isFavorite={authService
              .getFavoriteQuestions(currentUser.email)
              .some((favorite) => favorite.questionId === currentQuestion.questionId)}
            onToggleFavorite={() =>
              handleToggleFavoriteQuestion(currentQuestion)
            }
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
                  (player) => {
                    const bonusPoints = getChallengePoints(
                      gameSession,
                      challengeOutcome.challenge,
                      player.playerId,
                    )

                    return `${playerNames[player.playerId]}: ${bonusPoints} points, 
                    ${challengeOutcome.scores[player.playerId] }
                    /${QUESTIONS_PER_PLAYER} questions correct`
                  },
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
