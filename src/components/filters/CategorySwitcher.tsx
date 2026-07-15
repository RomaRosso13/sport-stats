import './CategorySwitcher.css'

const CATEGORY_LABELS = {
  Mixto: 'Mixto',
  Femenil: 'Femenil',
  Varonil: 'Varonil'
}

function CategorySwitcher({ categories, active, onChange, label = 'Categoría' }) {
  if (!categories || categories.length === 0) return null

  return (
    <div className="category-switcher">
      <div className="category-switcher-current">
        <span className="category-switcher-eyebrow">{label}</span>
        <span className="category-switcher-name">
          {CATEGORY_LABELS[active?.type] || active?.type || 'Selecciona una categoría'}
        </span>
      </div>

      {categories.length > 1 && (
        <div className="category-switcher-tabs">
          {categories.map(cat => {
            const isActive = String(cat.id) === String(active?.id)
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-switcher-tab ${isActive ? 'active' : ''}`}
                onClick={() => onChange(cat)}
              >
                {CATEGORY_LABELS[cat.type] || cat.type}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CategorySwitcher
