const OPEN_TDB_CATEGORIES = {
  general: 9,
  science: 17,
  technology: 18,
  sport: 21,
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []

    req.on('data', (chunk) => {
      chunks.push(chunk)
    })

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString() || '{}'

      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })

    req.on('error', reject)
  })
}

function decodeValue(value) {
  const withEntities = String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  try {
    return decodeURIComponent(withEntities.replace(/\+/g, ' '))
  } catch {
    return withEntities
  }
}

// developer-Will
function shuffle(items) {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

function normalizeQuestions(results, categoryId) {
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('The quiz API returned no questions.')
  }

  return results.map((item, index) => {
    const prompt = decodeValue(item.question)
    const correctAnswer = decodeValue(item.correct_answer)
    const options = shuffle([
      correctAnswer,
      ...item.incorrect_answers.map(decodeValue),
    ])

    if (!prompt || options.length < 2 || !options.includes(correctAnswer)) {
      throw new Error('The quiz API returned an invalid question.')
    }

    return {
      questionId: `${categoryId}-api-${Date.now()}-${index}`,
      prompt,
      options,
      correctAnswer,
    }
  })
}

async function fetchQuizQuestions(categoryId, count) {
  const apiCategory = OPEN_TDB_CATEGORIES[categoryId] ?? OPEN_TDB_CATEGORIES.general
  const url = new URL('https://opentdb.com/api.php')
  url.searchParams.set('amount', String(count))
  url.searchParams.set('category', String(apiCategory))
  url.searchParams.set('type', 'multiple')

  const response = await fetch(url)
  const payload = await response.json()

  if (!response.ok || payload.response_code !== 0) {
    const error = new Error('The quiz API could not provide questions.')
    error.statusCode = 502
    throw error
  }

  return normalizeQuestions(payload.results, categoryId)
}

function attachApi(server) {
  server.middlewares.use(async (req, res, next) => {
    const path = req.url?.split('?')[0]

    if (path !== '/api/questions') {
      next()
      return
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Use POST to request questions.' })
      return
    }

    try {
      const body = await readJsonBody(req)
      const categoryId = String(body.categoryId || '').trim()
      const count = Number(body.count) || 6

      if (!categoryId) {
        sendJson(res, 400, { error: 'categoryId is required.' })
        return
      }

      const questions = await fetchQuizQuestions(categoryId, count)
      sendJson(res, 200, { questions, source: 'opentdb' })
    } catch (error) {
      sendJson(res, error.statusCode || 500, {
        error: error.message || 'Unable to load quiz questions.',
      })
    }
  })
}

export function quizApiPlugin() {
  return {
    name: 'quiz-api-questions',
    configureServer(server) {
      attachApi(server)
    },
    configurePreviewServer(server) {
      attachApi(server)
    },
  }
}
