import { useEffect, useState } from 'react'
import MatchStatsPanel from './MatchStatsPanel'

function MatchRow({
  match,
  onChange,
  localPlayers = [],
  visitPlayers = [],
  statsEntries = [],
  statsTotals = {},
  savedStats = [],
  onAddStatEntry,
  onRemoveStatEntry,
  isStaff = false
}) {
  const [statsOpen, setStatsOpen] = useState(false)

  // 🔑 Hidratación inicial del marcador
  useEffect(() => {
    if (
      match.local_score == null &&
      match.away_score == null &&
      match.local_points != null &&
      match.visit_points != null
    ) {
      onChange({
        ...match,
        local_score: match.local_points,
        away_score: match.visit_points
      })
    }
  }, []) // 👈 SOLO una vez

  function update(field, value) {
    onChange({
      ...match,
      [field]: value
    })
  }

  const isFinished = match.status === 'Terminado'
  const isReview = match.status === 'Por aprobar'
  const cardStatusClass = isFinished ? 'finished' : isReview ? 'review' : 'pending'

  return (
    <div className={`match-card ${cardStatusClass}`}>
      {/* Local */}
      <div className="team">
        <img
          src={match.local_team.logo_url}
          alt={match.local_team.name}
          className="team-logo"
        />
        <span className="team-name">{match.local_team.name}</span>
      </div>

      {/* Marcador (SIEMPRE score) */}
      <div className="score-column">
        <div className="score">
          <input
            type="number"
            min="0"
            aria-label={`Marcador de ${match.local_team.name}`}
            value={match.local_score ?? ''}
            disabled={isFinished}
            onChange={e =>
              update('local_score', Number(e.target.value))
            }
          />
          <span className="vs">–</span>
          <input
            type="number"
            min="0"
            aria-label={`Marcador de ${match.visit_team.name}`}
            value={match.away_score ?? ''}
            disabled={isFinished}
            onChange={e =>
              update('away_score', Number(e.target.value))
            }
          />
        </div>

        {isFinished && (
          <span className="score-locked-hint">
            Cambia el estado a "Pendiente" para editar el marcador
          </span>
        )}
      </div>

      {/* Visitante */}
      <div className="team">
        <img
          src={match.visit_team.logo_url}
          alt={match.visit_team.name}
          className="team-logo"
        />
        <span className="team-name">{match.visit_team.name}</span>
      </div>

      {/* Status: SOLO habilita / deshabilita */}
      <div className="status">
        <label className="status-label">Estado</label>
        <select
          className={`status-select ${cardStatusClass}`}
          value={match.status}
          disabled={isStaff && isFinished}
          onChange={e => update('status', e.target.value)}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Por aprobar">Por aprobar</option>
          <option value="Terminado" disabled={isStaff}>Terminado</option>
        </select>
        {isStaff && (
          <span className="status-staff-hint">
            {isFinished
              ? 'Un administrador ya aprobó este resultado'
              : 'Un administrador debe aprobar el resultado para marcarlo como Terminado'}
          </span>
        )}
        {match.submitter && (
          <span className="submitted-by-hint">
            Capturado por: {match.submitter.name || match.submitter.email}
          </span>
        )}
      </div>

      {/* Estadísticas individuales */}
      <div className="stats-toggle-row">
        <button
          type="button"
          className="stats-toggle-btn"
          onClick={() => setStatsOpen(prev => !prev)}
        >
          {statsOpen ? '− Ocultar estadísticas' : '+ Estadísticas'}
          {(statsEntries.length + savedStats.length) > 0 && (
            <span className="stats-toggle-badge">{statsEntries.length + savedStats.length}</span>
          )}
        </button>
      </div>

      {statsOpen && (
        <MatchStatsPanel
          match={match}
          localPlayers={localPlayers}
          visitPlayers={visitPlayers}
          entries={statsEntries}
          savedStats={savedStats}
          statsTotals={statsTotals}
          onAddEntry={onAddStatEntry}
          onRemoveEntry={onRemoveStatEntry}
        />
      )}
    </div>
  )
}

export default MatchRow
