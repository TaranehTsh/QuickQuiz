// developer-Leon
export default function CategorySelectionView({
  activePlayerName,
  categories,
  onSelectCategory,
}) {
  return (
    <div className="view-panel">
      <div className="view-heading">
        <p className="view-kicker">{activePlayerName}&apos;s turn</p> {/* developer-Taraneh */}
        <h2>Choose a category</h2>
        <p className="view-description">
          Each colour represents a different category. Choose one to begin the
          timed question.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <button
            className="category-button"
            key={category.categoryId}
            onClick={() => onSelectCategory(category.categoryId)}
            style={{ '--category-colour': category.getColour() }} // developer-Leon
            type="button"
          >
            <span className="category-dot" aria-hidden="true" />
            <strong>{category.name}</strong>
            <small>Select category</small>
          </button>
        ))}
      </div>
    </div>
  )
}
