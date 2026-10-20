import GameSession from './models/GameSession.js'
import Player from './models/Player.js'
import CategoryQuestionRepository from './repositories/CategoryQuestionRepository.js'
import QuizAndTimerController from './controllers/QuizAndTimerController.js'
import TurnAndCategoryController from './controllers/TurnAndCategoryController.js'
import QuizApiQuestionService from './services/QuizApiQuestionService.js'
import PlayerResults from './services/PlayerResults.js'
import ResultsService from './services/ResultsService.js'
import { categoryData } from './data/questions.js'
import { QUESTION_TIME_LIMIT } from './gameConfig.js'

// developer-Leon: the UI and tests share the same game creation.
export default function createGame(mode = 'versus') {
  const players = [new Player('player-1')]
  if (mode === 'versus') players.push(new Player('player-2'))
  const gameSession = new GameSession(`session-${Date.now()}`, players, mode)
  const repository = new CategoryQuestionRepository(categoryData)
  const playerResults = new PlayerResults()
  return {
    gameSession, repository,
    turnController: new TurnAndCategoryController(gameSession, repository),
    quizController: new QuizAndTimerController(gameSession, repository, playerResults, QUESTION_TIME_LIMIT),
    questionService: new QuizApiQuestionService(repository),
    resultsService: new ResultsService(gameSession, playerResults, repository),
  }
}
