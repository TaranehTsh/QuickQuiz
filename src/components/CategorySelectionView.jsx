// developer-Leon
export default function CategorySelectionView({
  activePlayerName,
  categories,
  usedCategoryIds = new Set(), // this is a new prop, it is empty by default so nothing breaks if it is not passed in
  onSelectCategory,
}) {
  return (
    <div className="view-panel">
      <div className="view-heading">
        <p className="view-kicker">{activePlayerName}&apos;s turn</p> 
        <h2>Choose a category</h2>
        <p className="view-description">
          Each colour represents a different category. Choose one to begin the
          timed question.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => {
          const isUsed = usedCategoryIds.has(category.categoryId) // this checks if this one category was already played

          return (
            <button
              className={`category-button${isUsed ? ' category-button--used' : ''}`} // this adds an extra class so a used category looks greyed out
              key={category.categoryId}
              onClick={() => {
                if (!isUsed) onSelectCategory(category.categoryId) // this stops clicks from doing anything on a used category
              }}
              disabled={isUsed} // this turns the button off so it can not be clicked
              style={{ '--category-colour': category.getColour() }}
              type="button"
            >
              <span className="category-dot" aria-hidden="true" />
              <strong>{category.name}</strong>
              <small>{isUsed ? 'Already played' : 'Select category'}</small> {/* this swaps the small text when the category is used */}
            </button>
          )
        })}
      </div>
    </div>
  )
}
