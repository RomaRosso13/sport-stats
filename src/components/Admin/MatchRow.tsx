import { useEffect } from 'react'

function MatchRow({ match, onChange }) {

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

  return (
    <div className={`match-card ${isFinished ? 'finished' : ''}`}>
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
      <div className="score">
        <input
          type="number"
          value={match.local_score ?? ''}
          disabled={isFinished}
          onChange={e =>
            update('local_score', Number(e.target.value))
          }
        />
        <span className="vs">–</span>
        <input
          type="number"
          value={match.away_score ?? ''}
          disabled={isFinished}
          onChange={e =>
            update('away_score', Number(e.target.value))
          }
        />
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
        <select
          className="status-select"
          value={match.status}
          onChange={e => update('status', e.target.value)}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Terminado">Terminado</option>
        </select>
      </div>
    </div>
  )
}

export default MatchRow
