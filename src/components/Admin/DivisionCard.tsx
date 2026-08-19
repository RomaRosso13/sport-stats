import './DivisionCard.css'

function DivisionCard({ division, onToggleActive }) {
  return (
    <div className="division-card">
      <h4>{division.name}</h4>

      <span className={`status ${division.active ? 'active' : 'archived'}`}>
        {division.active ? 'Activa' : 'Archivada'}
      </span>

      <button
        type="button"
        className={division.active ? 'archive-btn' : 'activate-btn'}
        onClick={() => onToggleActive(division)}
      >
        {division.active ? 'Archivar' : 'Reactivar'}
      </button>
    </div>
  )
}

export default DivisionCard
