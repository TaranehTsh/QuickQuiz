// developer-Taraneh
// short How to play screen for new players
export default function HowToPlayView({ onClose }) {
  return (
    <div className="modal-overlay">
      <div
        aria-labelledby="how-to-play-title"
        aria-modal="true"
        className="modal-card instructions-card"
        role="dialog"
      >
        <p className="view-kicker">New player</p>
        <h3 id="how-to-play-title">How QuickQuiz works</h3>
        <ol className="instructions-list">
          <li>Two players share this device.</li>
          <li>Player 1 picks a category.</li>
          <li>Each player answers 3 questions. You have 15 seconds each.</li>
          <li>You can use one hint per round. It marks two wrong answers red.</li>
          <li>Pass the device. Player 2 gets 3 different questions in the same category.</li>
          <li>Player 2 then picks the next category. A game has two sets.</li>
          <li>At the end you see scores and who won.</li>
        </ol>
        <div className="modal-actions">
          <button className="primary-button" onClick={onClose} type="button">
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
