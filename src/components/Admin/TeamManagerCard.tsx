import './TeamManagerCard.css'

function TeamManagerCard({ team, coach, isSelected, onSelect, onEdit, onDelete }) {
  const playerCount = team.Player?.length || 0

  return (
    <div
      className={`team-manager-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(team)}
    >
      {team.logo_url ? (
        <img src={team.logo_url} alt={team.name} className="team-manager-logo" />
      ) : (
        <div className="team-manager-logo placeholder">?</div>
      )}

      <div className="team-manager-info">
        <h4>{team.name}</h4>
        <span className="team-manager-count">
          {playerCount} jugador{playerCount === 1 ? '' : 'es'}
        </span>
        {coach ? (
          <span className="team-manager-coach-tag assigned" title={coach.email}>
            Coach: {coach.name || coach.email}
          </span>
        ) : (
          <span className="team-manager-coach-tag pending">
            Sin coach asignado
          </span>
        )}
      </div>

      <div className="team-manager-actions">
        <button
          type="button"
          className="team-manager-edit-btn"
          onClick={e => {
            e.stopPropagation()
            onEdit(team)
          }}
        >
          Editar
        </button>

        <button
          type="button"
          className="team-manager-delete-btn"
          onClick={e => {
            e.stopPropagation()
            onDelete(team)
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

export default TeamManagerCard
