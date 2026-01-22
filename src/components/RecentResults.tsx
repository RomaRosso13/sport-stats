import "./RecentResults.css"

function RecentResults({ games }) {
  return (
    <div>
      {games.length === 0 && (
        <p className="empty">Aún no hay partidos jugados</p>
      )}

      <div className="resultados-lista">
      {games.map(p => {
        const ganadorLocal = p.local_points > p.visit_points
        const ganadorVisit = p.visit_points > p.local_points

        return (
          <div className="resultado-card" key={p.id}>
            
            {/* Equipo local */}
            <div className={`equipo lado izquierdo ${ganadorLocal ? "ganador" : ""}`}>
              <img
                src={p.local_team.logo_url}
                alt={p.local_team.name}
                className="team-logo"
              />
              <span className="team-name">{p.local_team.name}</span>
              {ganadorLocal && <span className="badge-win">WIN</span>}
            </div>

            {/* Marcador */}
            <span className="marcador">
              {p.local_points} - {p.visit_points}
            </span>

            {/* Equipo visitante */}
            <div className={`equipo lado derecho ${ganadorVisit ? "ganador" : ""}`}>
              <span className="team-name">{p.visit_team.name}</span>
              <img
                src={p.visit_team.logo_url}
                alt={p.visit_team.name}
                className="team-logo"
              />
              {ganadorVisit && <span className="badge-win">WIN</span>}
            </div>

            {/* Meta info */}
            <div className="meta">
              <span>{p.matchday}</span>
              <span>·</span>
              <span>Sede: {p.branch.name} Campo: {p.field.name}</span>
              <span>·</span>
              <span>Fecha: {p.date}</span>
            </div>
          </div>
        )
      })}
    </div>

    </div>
  )
}

export default RecentResults
