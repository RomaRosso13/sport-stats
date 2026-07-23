import { Link, useParams } from "react-router-dom"
import { STAGE_LABELS } from "../../utils/matchStages"
import "./ResultCard.css"

function ResultCard({ match }) {
  const { leagueSlug } = useParams()
  const isFinished = match.status === "Terminado"
  const isReview = match.status === "Por aprobar"
  const statusClass = isFinished ? "finished" : isReview ? "review" : "pending"
  const localGano = isFinished && match.local_points > match.visit_points
  const visitanteGano = isFinished && match.visit_points > match.local_points
  const isPlayoffMatch = match.type && match.type !== "Regular"

  return (
    <Link to={`/${leagueSlug}/partido/${match.id}`} className={`result-card ${statusClass}`}>
      <span className="result-status-tag">
        {isFinished ? "Final" : isReview ? "Por aprobar" : "Pendiente"}
      </span>

      {isPlayoffMatch && (
        <span className="result-stage-tag">{STAGE_LABELS[match.type]}</span>
      )}

      <div className="result-main">
        {/* LOCAL */}
        <div className={`team left ${localGano ? "winner" : ""}`}>
          <img
            src={match.local_team.logo_url}
            alt={match.local_team.name}
            className="team-logo"
            loading="lazy"
          />
          <span className="team-name" title={match.local_team.name}>{match.local_team.name}</span>
        </div>

        {/* SCORE */}
        <div className="score">
          <span className={localGano ? "winner" : ""}>
            {isFinished ? match.local_points : "-"}
          </span>
          <span className="dash">-</span>
          <span className={visitanteGano ? "winner" : ""}>
            {isFinished ? match.visit_points : "-"}
          </span>
        </div>

        {/* VISITANTE */}
        <div className={`team right ${visitanteGano ? "winner" : ""}`}>
          <span className="team-name" title={match.visit_team.name}>{match.visit_team.name}</span>
          <img
            src={match.visit_team.logo_url}
            alt={match.visit_team.name}
            className="team-logo"
            loading="lazy"
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
