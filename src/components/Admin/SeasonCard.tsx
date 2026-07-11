import './SeasonCard.css'

function SeasonCard({ season, isSelected, onSelect }) {
  return (
    <div
      className={`season-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(season)}
    >
      <h4>{season.name}</h4>

      <span className={`status ${season.active ? 'active' : 'archived'}`}>
        {season.active ? 'Activa' : 'Archivada'}
      </span>
    </div>
  )
}

export default SeasonCard
