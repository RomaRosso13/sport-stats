import "./StatsTable.css"

function StatsTable({ title, statKey, data }) {
  if (!data || data.length === 0) return null

  const [leader, ...rest] = data

  return (
    <div className="stats-card espn">
      <div className="stats-header">
        <span className="stats-title">{title}</span>
      </div>

      {/* Líder */}
      <div className="stats-leader">
        <span className="leader-value">{leader[statKey]}</span>
        <div className="leader-info">
          <span className="leader-name">{leader.nombre}</span>
          <span className="leader-team">{leader.equipo}</span>
        </div>
      </div>

      {/* Resto */}
      <div className="stats-rest">
        {rest.slice(0, 2).map((p, index) => (
          <div key={p.id} className="stats-row">
            <span className="rest-rank">{index + 2}</span>
            <span className="rest-name">{p.nombre}</span>
            <span className="rest-value">{p[statKey]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsTable
