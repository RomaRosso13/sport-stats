import TeamLogo from '../common/TeamLogo'
import './NextGameDay.css'

function NextGameDay({ data }) {
  if (!data) {
    return <p className="empty">Temporada finalizada</p>
  }

  return (
    <div className="partidos-list">
      {data.games.map((p, index) => (
        <div className="partido-card" key={index}>
          
          {/* LOCAL */}
          <div className="equipo lado izquierdo">
            <TeamLogo logoUrl={p.local_team.logo_url} name={p.local_team.name} alt={p.local_team.name} className="team-logo" />
            <span>{p.local_team.name}</span>
          </div>

          <span className="vs">vs</span>

          {/* VISITANTE */}
          <div className="equipo lado derecho">
            <span>{p.visit_team.name}</span>
            <TeamLogo logoUrl={p.visit_team.logo_url} name={p.visit_team.name} alt={p.visit_team.name} className="team-logo" />
          </div>

          {/* META */}
          <div className="meta">
            <span>{p.matchday}</span>
            <span>·</span>
            <span>Sede: {p.branch.name}</span>
            <span>·</span>
            <span>Campo: {p.field.name}</span>
            <span>·</span>
            <span>Fecha: {p.date}</span>
            <span>·</span>
            <span>Hora:{p.hour}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NextGameDay
