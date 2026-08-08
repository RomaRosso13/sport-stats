import TeamLogo from '../common/TeamLogo'
import './TeamManagerCard.css'

function TeamManagerCard({ team, coach, isSelected, onSelect, onEdit, onDelete, onToggleActive }) {
  const playerCount = team.Player?.length || 0

  return (
    <div
      className={`team-manager-card ${isSelected ? 'selected' : ''} ${team.active === false ? 'inactive' : ''}`}
      onClick={() => onSelect(team)}
    >
      <TeamLogo logoUrl={team.logo_url} name={team.name} alt={team.name} className="team-manager-logo" />

      <div className="team-manager-info">
        <h4>{team.name}</h4>
        <span className="team-manager-count">
          {playerCount} jugador{playerCount === 1 ? '' : 'es'}
        </span>
        {team.active === false && (
          <span className="team-manager-inactive-tag">Inactivo</span>
        )}
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
          className={team.active === false ? 'team-manager-activate-btn' : 'team-manager-deactivate-btn'}
          onClick={e => {
            e.stopPropagation()
            onToggleActive(team)
          }}
        >
          {team.active === false ? 'Activar' : 'Desactivar'}
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
