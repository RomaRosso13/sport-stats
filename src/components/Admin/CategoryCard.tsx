import './CategoryCard.css'

function CategoryCard({ category, isSelected, onSelect, onToggleActive, onEdit, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  return (
    <div
      className={`category-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(category)}
    >
      <div className="category-order-controls">
        <button
          type="button"
          className="category-order-btn"
          disabled={!canMoveUp}
          onClick={e => { e.stopPropagation(); onMoveUp(category) }}
          aria-label="Mover categoría hacia arriba"
        >
          ▲
        </button>
        <button
          type="button"
          className="category-order-btn"
          disabled={!canMoveDown}
          onClick={e => { e.stopPropagation(); onMoveDown(category) }}
          aria-label="Mover categoría hacia abajo"
        >
          ▼
        </button>
      </div>

      <h4>{category.type}</h4>

      <span className={`status ${category.active ? 'active' : 'archived'}`}>
        {category.active ? 'Activa' : 'Archivada'}
      </span>

      <div className="category-actions">
        <button
          type="button"
          className="category-edit-btn"
          onClick={e => { e.stopPropagation(); onEdit(category) }}
        >
          Editar
        </button>

        <button
          type="button"
          className={category.active ? 'archive-btn' : 'activate-btn'}
          onClick={e => { e.stopPropagation(); onToggleActive(category) }}
        >
          {category.active ? 'Archivar' : 'Reactivar'}
        </button>
      </div>
    </div>
  )
}

export default CategoryCard
