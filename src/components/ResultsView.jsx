// developer-Will
export default function ResultsView({ results, playerNames, onRestart }) {
  const summary = results.isTie
    ? 'The quiz finished in a tie.'
    : `${playerNames[results.winnerPlayerId]} wins the quiz!`

  const rankedPlayers = [...results.players].sort((a, b) => b.score - a.score) // highest score first

  return (
    <div className="view-panel">
      <header className="results-header">
        <p className="view-kicker">Final results</p>
        <h2>Performance comparison</h2>
        <p>Compare both players&apos; scores, accuracy, strengths and weaknesses.</p>
      </header>

      <div className="result-summary">{summary}</div>

      <div className="results-grid">
        {rankedPlayers.map((player, index) => {
          const isWinner = player.playerId === results.winnerPlayerId

          return (
            // developer-Will
            <article
              className={`result-card ${isWinner ? 'result-card--winner' : ''}`}
              key={player.playerId}
            >
              <span className="result-rank">#{index + 1}</span>
              <h3>
                {playerNames[player.playerId]} {isWinner && <span aria-label="Winner">🏆</span>}
              </h3>
              {/* developer-Will */}
              <div className="result-score">
                {player.score} <small>points</small>
              </div>

              <dl className="stat-list">
                <div className="stat-row">
                  <dt>Correct</dt>
                  <dd>{player.correctCount}</dd>
                </div>
                <div className="stat-row">
                  <dt>Incorrect</dt>
                  <dd>{player.incorrectCount}</dd>
                </div>
                <div className="stat-row">
                  <dt>Accuracy</dt>
                  <dd>{player.accuracy}%</dd>
                </div>
                {/* developer-Tim */}
                <div className="stat-row">
                  <dt>Strength</dt>
                  <dd>{player.strength}</dd>
                </div>
                <div className="stat-row">
                  <dt>Weakness</dt>
                  <dd>{player.weakness}</dd>
                </div>
              </dl>
            </article>
          )
        })}
      </div>

      <button className="primary-button" onClick={onRestart} type="button">
        Play again
      </button>
    </div>
  )
}
