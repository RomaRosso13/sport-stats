import "./ResultCard.css"

function ResultCard({ match }) {
  const localGano = match.local_points > match.visit_points
  const visitanteGano = match.visit_points > match.local_points

  return (
    <div className="result-card">

      <div className="result-main">
        {/* LOCAL */}
        <div className={`team left ${localGano ? "winner" : ""}`}>
          <img
            src={match.local_team.logo_url}
            alt={match.local_team.name}
            className="team-logo"
          />
          <span className="team-name">{match.local_team.name}</span>
        </div>

        {/* SCORE */}
        <div className="score">
          <span className={localGano ? "winner" : ""}>
            {match.local_points}
          </span>
          <span className="dash">-</span>
          <span className={visitanteGano ? "winner" : ""}>
            {match.visit_points}
          </span>
        </div>

        {/* VISITANTE */}
        <div className={`team right ${visitanteGano ? "winner" : ""}`}>
          <span className="team-name">{match.visit_team.name}</span>
          <img
            src={match.visit_team.logo_url}
            alt={match.visit_team.name}
            className="team-logo"
          />
        </div>
      </div>

      <div className="result-meta">
        <span>Sede: {match.branch.name}</span>
        <span>·</span>
        <span>Fecha: {match.date}</span>
        <span>·</span>
        <span>Hora: {match.hour}</span>
        <span>·</span>
        <span>Campo: {match.field.name}</span>
      </div>

    </div>
  )
}

export default ResultCard
