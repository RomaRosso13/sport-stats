import './SeasonCard.css'

function SeasonCard({ season, isSelected, onSelect, onToggleActive, onEdit }) {
  return (
    <div
      className={`season-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(season)}
    >
      <h4>{season.name}</h4>

      <span className={`status ${season.active ? 'active' : 'archived'}`}>
        {season.active ? 'Activa' : 'Archivada'}
      </span>

      <div className="season-actions">
        <button
          type="button"
          className="season-edit-btn"
          onClick={e => { e.stopPropagation(); onEdit(season) }}
        >
          Editar
        </button>

        <button
          type="button"
          className={season.active ? 'archive-btn' : 'activate-btn'}
          onClick={e => { e.stopPropagation(); onToggleActive(season) }}
        >
          {season.active ? 'Archivar' : 'Reactivar'}
        </button>
      </div>
    </div>
  )
}

export default SeasonCard
