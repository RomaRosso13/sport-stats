import TeamLogo from '../common/TeamLogo'
import './TeamManagerCard.css'

const CATEGORY_LABELS = { Mixto: 'Mixto', Femenil: 'Femenil', Varonil: 'Varonil' }

function TeamManagerCard({ team, coach, isSelected, onSelect, onEdit, onDelete, onToggleActive, divisions = [], onSetDivision, franchiseCategories, activeCategoryType, mergeMode, mergeSelected, onToggleMergeSelect }) {
  const playerCount = team.Player?.length || 0
  const isFranchise = !!franchiseCategories && franchiseCategories.length > 1

  return (
    <div
      className={`team-manager-card ${isSelected ? 'selected' : ''} ${team.active === false ? 'inactive' : ''} ${isFranchise ? 'franchise' : ''} ${mergeMode && mergeSelected ? 'selected' : ''}`}
      onClick={() => mergeMode ? onToggleMergeSelect(team) : onSelect(team)}
    >
      {mergeMode && (
        <div className={`merge-check ${mergeSelected ? 'on' : ''}`}>{mergeSelected ? '✓' : ''}</div>
      )}

      <TeamLogo logoUrl={team.logo_url} name={team.name} alt={team.name} className="team-manager-logo" />

      <div className="team-manager-info">
        <h4>{team.name}</h4>
        <span className="team-manager-count">
          {playerCount} jugador{playerCount === 1 ? '' : 'es'}
        </span>
        {isFranchise && (
          <div className="franchise-cat-chips">
            {franchiseCategories.map((c, i) => (
              <span key={`${c.type}-${i}`} className={`badge badge-cat ${(c.type || '').toLowerCase()} ${c.type === activeCategoryType ? '' : 'dim'}`}>
                {CATEGORY_LABELS[c.type] || c.type}
              </span>
            ))}
          </div>
        )}
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

        {divisions.length > 0 && (
          <select
            className="team-manager-division-select"
            value={team.division_id ?? ''}
            onClick={e => e.stopPropagation()}
            onChange={e => onSetDivision(team, e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Sin asignar</option>
            {divisions.map(division => (
              <option key={division.id} value={division.id}>{division.name}</option>
            ))}
          </select>
        )}
      </div>

      {!mergeMode && (
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
      )}
    </div>
  )
}

export default TeamManagerCard
