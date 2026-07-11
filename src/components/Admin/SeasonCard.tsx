import './SeasonCard.css'

function SeasonCard({ season, isSelected, onSelect, onToggleActive }) {
  return (
    <div
      className={`season-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(season)}
    >
      <h4>{season.name}</h4>

      <span className={`status ${season.active ? 'active' : 'archived'}`}>
        {season.active ? 'Activa' : 'Archivada'}
      </span>

      <button
        type="button"
        className={season.active ? 'archive-btn' : 'activate-btn'}
        onClick={e => { e.stopPropagation(); onToggleActive(season) }}
      >
        {season.active ? 'Archivar' : 'Reactivar'}
      </button>
    </div>
  )
}

export default SeasonCard
