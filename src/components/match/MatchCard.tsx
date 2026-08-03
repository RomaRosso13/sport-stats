import TeamLogo from "../common/TeamLogo"
import VenueLink from "../common/VenueLink"
import "./MatchCard.css"

function MatchCard({ match }) {
  const isFinished = match.status === "Terminado"

  const localWon = isFinished && match.local_points > match.visit_points
  const visitorWon = isFinished && match.visit_points > match.local_points
  const isDraw = isFinished && match.local_points === match.visit_points

  return (
    <div
      className={`match-card
        ${isFinished ? "finished" : "pending"}
        ${isDraw ? "draw" : ""}
      `}
    >
      {/* TOP ROW */}
      <div className="match-top">

        {/* LOCAL */}
        <div className={`team local ${localWon ? "winner" : visitorWon ? "loser" : ""}`}>
          <TeamLogo logoUrl={match.local_team.logo_url} name={match.local_team.name} alt="" className="team-logo" />
          <span>{match.local_team.name}</span>
        </div>

        <span className={`score-inline ${localWon ? "winner" : ""}`}>
          {isFinished ? match.local_points : "-"}
        </span>

        <span className="vs">vs</span>

        <span className={`score-inline ${visitorWon ? "winner" : ""}`}>
          {isFinished ? match.visit_points : "-"}
        </span>

        {/* VISITOR */}
        <div className={`team visitor ${visitorWon ? "winner" : localWon ? "loser" : ""}`}>
          <span>{match.visit_team.name}</span>
          <TeamLogo logoUrl={match.visit_team.logo_url} name={match.visit_team.name} alt="" className="team-logo" />
        </div>
      </div>

      {/* META */}
      <div className="match-meta centered">
        {isFinished ? (
          <span className="status-finished">Finalizado</span>
        ) : (
          <span className="status-pending">Por jugar</span>
        )}
        <span><VenueLink branch={match.branch} /> · {match.field.name}</span>
        <span>{match.hour}</span>
      </div>
    </div>
  )
}

export default MatchCard
