export default class PlayerResults {
  constructor() {
    this.answerRecords = []
  }

  recordAnswer(answerRecord) {
    this.answerRecords.push(answerRecord)
  }

  getRecordsForPlayer(playerId) {
    return this.answerRecords.filter((record) => record.playerId === playerId)
  }

  getStatistics(playerId, repository) {
    const records = this.getRecordsForPlayer(playerId)
    const correctCount = records.filter((record) => record.getResult()).length
    const incorrectCount = records.length - correctCount
    const categoryMap = new Map()

    records.forEach((record) => {
      const question = repository.getQuestionById(record.questionId)
      const category = repository.getCategory(question.categoryId)
      const current = categoryMap.get(category.categoryId) ?? {
        name: category.name,
        correct: 0,
        total: 0,
      }

      current.total += 1
      current.correct += record.getResult() ? 1 : 0
      categoryMap.set(category.categoryId, current)
    })

    const categoryStatistics = [...categoryMap.values()].map((category) => ({
      ...category,
      accuracy: Math.round((category.correct / category.total) * 100),
    }))

    const strongest = [...categoryStatistics].sort(
      (a, b) => b.accuracy - a.accuracy || b.total - a.total,
    )[0]
    const weakest = [...categoryStatistics].sort(
      (a, b) => a.accuracy - b.accuracy || b.total - a.total,
    )[0]

    return {
      totalAnswers: records.length,
      correctCount,
      incorrectCount,
      accuracy:
        records.length === 0
          ? 0
          : Math.round((correctCount / records.length) * 100),
      strength: strongest?.name ?? 'No data',
      weakness: weakest?.name ?? 'No data',
      categoryStatistics,
    }
  }
}
