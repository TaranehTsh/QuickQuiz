export default function ResultsView({ results, playerNames, onRestart }) {
  const summary = results.isTie
    ? 'The quiz finished in a tie.'
    : `${playerNames[results.winnerPlayerId]} wins the quiz!`

  return (
    <div className="view-panel">
      <header className="results-header">
        <p className="view-kicker">Final results</p>
        <h2>Performance comparison</h2>
        <p>Compare both players&apos; scores, accuracy, strengths and weaknesses.</p>
      </header>

      <div className="result-summary">{summary}</div>

      <div className="results-grid">
        {results.players.map((player) => (
          <article className="result-card" key={player.playerId}>
            <h3>{playerNames[player.playerId]}</h3>
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
        ))}
      </div>

      <button className="primary-button" onClick={onRestart} type="button">
        Play again
      </button>
    </div>
  )
}
