import { Link, useParams } from "react-router-dom"
import { STAGE_LABELS } from "../../utils/matchStages"
import "./ResultCard.css"

function ResultCard({ match }) {
  const { leagueSlug } = useParams()
  const localGano = match.local_points > match.visit_points
  const visitanteGano = match.visit_points > match.local_points
  const isPendiente = match.status === "Pendiente"
  const isPlayoffMatch = match.type && match.type !== "Regular"

  return (
    <Link to={`/${leagueSlug}/partido/${match.id}`} className={`result-card ${isPendiente ? "pending" : "finished"}`}>
      <span className="result-status-tag">
        {isPendiente ? "Pendiente" : "Final"}
      </span>

      {isPlayoffMatch && (
        <span className="result-stage-tag">{STAGE_LABELS[match.type]}</span>
      )}

      <div className="result-main">
        {/* LOCAL */}
        <div className={`team left ${!isPendiente && localGano ? "winner" : ""}`}>
          <img
            src={match.local_team.logo_url}
            alt={match.local_team.name}
            className="team-logo"
          />
          <span className="team-name" title={match.local_team.name}>{match.local_team.name}</span>
        </div>

        {/* SCORE */}
        <div className="score">
          <span className={!isPendiente && localGano ? "winner" : ""}>
            {isPendiente ? "-" : match.local_points}
          </span>
          <span className="dash">-</span>
          <span className={!isPendiente && visitanteGano ? "winner" : ""}>
            {isPendiente ? "-" : match.visit_points}
          </span>
        </div>

        {/* VISITANTE */}
        <div className={`team right ${!isPendiente && visitanteGano ? "winner" : ""}`}>
          <span className="team-name" title={match.visit_team.name}>{match.visit_team.name}</span>
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
        <span>Hora: {match.hour.slice(0, 5)}</span>
        <span>·</span>
        <span>Campo: {match.field.name}</span>
      </div>

    </Link>
  )
}

export default ResultCard
