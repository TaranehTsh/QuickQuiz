import GameSession from '../models/GameSession.js'
import Player from '../models/Player.js'
import Challenge from '../models/Challenge.js'
import CategoryQuestionRepository from '../repositories/CategoryQuestionRepository.js'
import QuizAndTimerController from '../controllers/QuizAndTimerController.js'
import PlayerResults from '../services/PlayerResults.js'
import ResultsService from '../services/ResultsService.js'
import { categoryData } from '../data/questions.js'

export function makeGame(mode = 'versus') {
  const players = mode === 'practice'
    ? [new Player('player-1')]
    : [new Player('player-1'), new Player('player-2')]
  const session = new GameSession('test-session', players, mode)
  const repository = new CategoryQuestionRepository(categoryData)
  const records = new PlayerResults()
  const controller = new QuizAndTimerController(session, repository, records, 15)
  const results = new ResultsService(session, records, repository)
  return { session, repository, records, controller, results }
}

export function completeNormalGame(game, firstScore = 2, secondScore = 2) {
  const questions = game.repository.getCategories()[0].getQuestions().slice(0, 6)
  for (let set = 1; set <= 2; set += 1) {
    const challenge = new Challenge(set, 'general', 'player-1', 'player-2',
      questions.slice(0, 3), questions.slice(3, 6))
    challenge.recordPlayerResult('player-1', 1)
    challenge.recordPlayerResult('player-2', 1)
    game.session.startChallenge(challenge)
  }
  game.session.players[0].score = firstScore
  game.session.players[1].score = secondScore
}
