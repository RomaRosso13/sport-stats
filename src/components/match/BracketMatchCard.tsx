import { Link, useParams } from "react-router-dom"
import "./BracketMatchCard.css"

function BracketMatchCard({ match }) {
  const { leagueSlug } = useParams()

  if (!match) {
    return (
      <div className="bracket-card placeholder">
        <span>Por definir</span>
      </div>
    )
  }

  const isPendiente = match.status === "Pendiente"
  const localGano = !isPendiente && match.local_points > match.visit_points
  const visitanteGano = !isPendiente && match.visit_points > match.local_points

  return (
    <div className={`bracket-card ${isPendiente ? "pending" : "finished"}`}>
      <div className={`bracket-team ${localGano ? "winner" : ""}`}>
        <Link to={`/${leagueSlug}/equipos/${match.local_team.id}`} className="bracket-team-link">
          <img src={match.local_team.logo_url} alt={match.local_team.name} />
          <span className="bracket-team-name" title={match.local_team.name}>{match.local_team.name}</span>
        </Link>
        <span className="bracket-team-score">{isPendiente ? "-" : match.local_points}</span>
      </div>

      <div className={`bracket-team ${visitanteGano ? "winner" : ""}`}>
        <Link to={`/${leagueSlug}/equipos/${match.visit_team.id}`} className="bracket-team-link">
          <img src={match.visit_team.logo_url} alt={match.visit_team.name} />
          <span className="bracket-team-name" title={match.visit_team.name}>{match.visit_team.name}</span>
        </Link>
        <span className="bracket-team-score">{isPendiente ? "-" : match.visit_points}</span>
      </div>

      <div className="bracket-card-meta">
        {match.date}{!isPendiente && " · Final"}
      </div>
    </div>
  )
}

export default BracketMatchCard
