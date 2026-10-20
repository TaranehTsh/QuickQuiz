// developer-Will
export default function ResultsView({ results, playerNames, onRestart }) {
  const isPractice = results.mode === 'practice'
  const summary = isPractice
    ? 'Practice complete. Try another category to keep improving!'
    : results.isTie
      ? 'The quiz finished in a tie.'
      : `${playerNames[results.winnerPlayerId]} wins the quiz!`

  // A tie-break winner ranks first, including after repeated correct answers
  // with different speed bonuses. Normal games still rank by total score.
  const rankedPlayers = [...results.players].sort((a, b) =>
    Number(b.playerId === results.winnerPlayerId) -
      Number(a.playerId === results.winnerPlayerId) || b.score - a.score,
  )

  return (
    <div className="view-panel">
      <header className="results-header">
        <p className="view-kicker">{isPractice ? 'Solo Practice' : 'Final results'}</p>
        <h2>{isPractice ? 'Your practice results' : 'Performance comparison'}</h2>
        <p>{isPractice ? 'Review your score and accuracy.' : 'Compare both players\u2019 scores, accuracy, strengths and weaknesses.'}</p>
      </header>

      <div className="result-summary">{summary}</div>

      {!isPractice && results.suddenDeathRounds > 0 && (
        <p className="view-description">Decided by sudden death after {results.suddenDeathRounds} question(s).</p>
      )}

      <div className={`results-grid ${isPractice ? 'results-grid--practice' : ''}`}>
        {rankedPlayers.map((player, index) => {
          const isWinner = player.playerId === results.winnerPlayerId

          return (
            // developer-Will
            <article
              className={`result-card ${isWinner ? 'result-card--winner' : ''}`}
              key={player.playerId}
            >
              {!isPractice && <span className="result-rank">#{index + 1}</span>}
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
        Back to dashboard
      </button>
    </div>
  )
}
