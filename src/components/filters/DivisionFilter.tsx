import './DivisionFilter.css'

// Solo aparece si la categoría activa tiene divisiones — una liga que no
// las usa no ve ningún cambio. `activeDivisionId` null = "General" (todos).
function DivisionFilter({ divisions, activeDivisionId, onChange }) {
  if (!divisions || divisions.length === 0) return null

  return (
    <div className="division-filter">
      <button
        type="button"
        className={`division-filter-tab ${!activeDivisionId ? 'active' : ''}`}
        onClick={() => onChange(null)}
      >
        General
      </button>
      {divisions.map(division => (
        <button
          key={division.id}
          type="button"
          className={`division-filter-tab ${String(activeDivisionId) === String(division.id) ? 'active' : ''}`}
          onClick={() => onChange(division.id)}
        >
          División {division.name}
        </button>
      ))}
    </div>
  )
}

export default DivisionFilter
