import "./TeamStats.css"

function TeamStats({ stats }) {
  const total = stats.ganados + stats.perdidos + stats.empatados || 1
  const diff = stats.puntosFavor - stats.puntosContra
  const diffLabel = diff > 0 ? `+${diff}` : `${diff}`
  const diffClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : ''

  return (
    <div className="team-stats">

      <div className="record-row">
        <div className="record-item">
          <span className="record-value">{stats.partidos}</span>
          <span className="record-label">PJ</span>
        </div>
        <div className="record-item win">
          <span className="record-value">{stats.ganados}</span>
          <span className="record-label">G</span>
        </div>
        <div className="record-item loss">
          <span className="record-value">{stats.perdidos}</span>
          <span className="record-label">P</span>
        </div>
        {stats.empatados > 0 && (
          <div className="record-item draw">
            <span className="record-value">{stats.empatados}</span>
            <span className="record-label">E</span>
          </div>
        )}
      </div>

      <div className="stats-bars">
        <div className="bar win" style={{ width: `${(stats.ganados / total) * 100}%` }} />
        <div className="bar loss" style={{ width: `${(stats.perdidos / total) * 100}%` }} />
        {stats.empatados > 0 && (
          <div className="bar draw" style={{ width: `${(stats.empatados / total) * 100}%` }} />
        )}
      </div>

      <div className="points-row">
        <div className="points-item">
          <span className="points-value">{stats.puntosFavor}</span>
          <span className="points-label">A favor</span>
        </div>
        <div className="points-item">
          <span className="points-value">{stats.puntosContra}</span>
          <span className="points-label">En contra</span>
        </div>
        <div className="points-item">
          <span className={`points-value diff ${diffClass}`}>{diffLabel}</span>
          <span className="points-label">Dif.</span>
        </div>
      </div>

    </div>
  )
}

export default TeamStats
