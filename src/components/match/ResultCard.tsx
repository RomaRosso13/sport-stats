import { Link, useParams } from "react-router-dom"
import { STAGE_LABELS } from "../../utils/matchStages"
import { getWinProbabilities, getWinProbColors, getScoreDominance } from "../../utils/getWinProbability"
import TeamLogo from "../common/TeamLogo"
import VenueLink from "../common/VenueLink"
import "./ResultCard.css"

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || '?'
}

function ResultCard({ match, mvp, standingsById = {} }) {
  const { leagueSlug } = useParams()
  const isFinished = match.status === "Terminado"
  const isReview = match.status === "Por aprobar"
  const statusClass = isFinished ? "finished" : isReview ? "review" : "pending"
  const localGano = isFinished && match.local_points > match.visit_points
  const visitanteGano = isFinished && match.visit_points > match.local_points
  const isPlayoffMatch = match.type && match.type !== "Regular"

  const localRow = standingsById[match.local_team.id]
  const visitRow = standingsById[match.visit_team.id]
  const { local: localProb, visit: visitProb } = getWinProbabilities(localRow, visitRow)
  const { local: localColor, visit: visitColor } = getWinProbColors(localProb, visitProb)

  const { local: localDom, visit: visitDom } = getScoreDominance(match.local_points, match.visit_points)
  const { local: localDomColor, visit: visitDomColor } = getWinProbColors(localDom, visitDom)

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
          <TeamLogo logoUrl={match.local_team.logo_url} name={match.local_team.name} alt={match.local_team.name} className="team-logo" />
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
          <TeamLogo logoUrl={match.visit_team.logo_url} name={match.visit_team.name} alt={match.visit_team.name} className="team-logo" />
        </div>
      </div>

      {!isFinished && (
        <div
          className="result-win-prob"
          title={`Probabilidad según historial: ${match.local_team.name} ${localProb}% · ${match.visit_team.name} ${visitProb}%`}
        >
          <span className="result-win-prob-pct local">{localProb}%</span>
          <div className="result-win-prob-bar">
            <span className="result-win-prob-fill" style={{ width: `${localProb}%`, background: localColor }} />
            <span className="result-win-prob-fill" style={{ width: `${visitProb}%`, background: visitColor }} />
          </div>
          <span className="result-win-prob-pct visit">{visitProb}%</span>
        </div>
      )}

      {isFinished && (
        <div
          className="result-win-prob"
          title={`Dominancia del marcador: ${match.local_team.name} ${localDom}% · ${match.visit_team.name} ${visitDom}%`}
        >
          <span className="result-win-prob-pct local">{localDom}%</span>
          <div className="result-win-prob-bar">
            <span className="result-win-prob-fill" style={{ width: `${localDom}%`, background: localDomColor }} />
            <span className="result-win-prob-fill" style={{ width: `${visitDom}%`, background: visitDomColor }} />
          </div>
          <span className="result-win-prob-pct visit">{visitDom}%</span>
        </div>
      )}

      {isFinished && mvp && (
        <div className="result-mvp">
          <span className="result-mvp-label">Destacado</span>
          {mvp.photo ? (
            <img src={mvp.photo} alt={mvp.name} className="result-mvp-photo" loading="lazy" />
          ) : (
            <span className="result-mvp-avatar">{getInitial(mvp.name)}</span>
          )}
          <span className="result-mvp-name">{mvp.name}</span>
        </div>
      )}

      <div className="result-meta">
        <span>Sede: <VenueLink branch={match.branch} /></span>
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
