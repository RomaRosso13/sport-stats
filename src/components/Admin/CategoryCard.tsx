import './CategoryCard.css'

function CategoryCard({ category, isSelected, onSelect, onToggleActive }) {
  return (
    <div
      className={`category-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(category)}
    >
      <h4>{category.type}</h4>

      <span className={`status ${category.active ? 'active' : 'archived'}`}>
        {category.active ? 'Activa' : 'Archivada'}
      </span>

      <button
        type="button"
        className={category.active ? 'archive-btn' : 'activate-btn'}
        onClick={e => { e.stopPropagation(); onToggleActive(category) }}
      >
        {category.active ? 'Archivar' : 'Reactivar'}
      </button>
    </div>
  )
}

export default CategoryCard
