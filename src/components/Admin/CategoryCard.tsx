import './CategoryCard.css'

function CategoryCard({ category, isSelected, onSelect }) {
  return (
    <div
      className={`category-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(category)}
    >
      <h4>{category.type}</h4>

      <span className={`status ${category.active ? 'active' : 'archived'}`}>
        {category.active ? 'Activa' : 'Archivada'}
      </span>
    </div>
  )
}

export default CategoryCard
