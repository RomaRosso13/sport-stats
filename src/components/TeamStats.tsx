import "./TeamStats.css"

function TeamStats({ stats }) {
  const total = Math.max(stats.ganados, stats.perdidos, stats.empatados, 1)

  return (
    <div className="team-stats">

      <div className="stats-numbers">
        <span>PJ: {stats.partidos}</span>
        <span>G: {stats.ganados}</span>
        <span>P: {stats.perdidos}</span>
        {stats.empatados > 0 && <span>E: {stats.empatados}</span>}
      </div>

      <div className="stats-bars">
        <div className="bar win" style={{ width: `${(stats.ganados / total) * 100}%` }}>
          Ganados
        </div>
        <div className="bar loss" style={{ width: `${(stats.perdidos / total) * 100}%` }}>
          Perdidos
        </div>
        {stats.empatados > 0 && (
          <div className="bar draw" style={{ width: `${(stats.empatados / total) * 100}%` }}>
            Empates
          </div>
        )}
      </div>

      <div className="points">
        <span>PF: {stats.puntosFavor}</span>
        <span>PC: {stats.puntosContra}</span>
      </div>

    </div>
  )
}

export default TeamStats
