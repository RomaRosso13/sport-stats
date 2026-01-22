import "./MatchCard.css"

function MatchCard({ match }) {
  const isFinished = match.status === "Terminado"

  const localWon =
    isFinished && match.local_points > match.visit_points

  const visitorWon =
    isFinished && match.visit_points > match.local_points

  const isDraw =
    isFinished && match.local_points === match.visit_points

  return (
    <div className={`match-card ${isFinished ? "finished" : "pending"}`}>

      {/* TEAMS */}
      <div className="teams">
        {/* LOCAL */}
        <div
          className={`team local ${
            localWon ? "winner" : isFinished ? "loser" : ""
          }`}
        >
          <img
            src={match.local_team.logo_url}
            alt={match.local_team.name}
            className="team-logo"
          />
          <span>{match.local_team.name}</span>
        </div>

        <span className="vs">vs</span>

        {/* VISITOR */}
        <div
          className={`team visitor ${
            visitorWon ? "winner" : isFinished ? "loser" : ""
          }`}
        >
          <span>{match.visit_team.name}</span>
          <img
            src={match.visit_team.logo_url}
            alt={match.visit_team.name}
            className="team-logo"
          />
        </div>
      </div>

      {/* SCORE / STATUS */}
      <div className="match-info">
        {isFinished ? (
          <span className="score">
            {match.local_points}
            <small> - </small>
            {match.visit_points}
          </span>
        ) : (
          <span className="status-badge">Por jugar</span>
        )}
      </div>

      {/* META */}
      <div className="match-meta">
        <span>{match.branch.name}</span>
        <span>Campo {match.field.name}</span>
      </div>

      {isDraw && <div className="draw-label">Empate</div>}
    </div>
  )
}

export default MatchCard
