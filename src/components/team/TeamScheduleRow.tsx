import TeamLogo from '../common/TeamLogo'
import './TeamScheduleRow.css'

function TeamScheduleRow({ match, teamId }) {
  const isLocal = String(match.local_team.id) === String(teamId)
  const opponent = isLocal ? match.visit_team : match.local_team
  const teamScore = isLocal ? match.local_points : match.visit_points
  const opponentScore = isLocal ? match.visit_points : match.local_points

  const isFinished = match.status === 'Terminado'
  const isWin = isFinished && teamScore > opponentScore
  const isLoss = isFinished && teamScore < opponentScore
  const isDraw = isFinished && teamScore === opponentScore

  const resultLetter = isWin ? 'G' : isLoss ? 'P' : isDraw ? 'E' : null

  return (
    <div className={`schedule-row ${isFinished ? (isWin ? 'win' : isLoss ? 'loss' : 'draw') : 'pending'}`}>
      <div className="schedule-matchday">
        <span className="schedule-matchday-name">{match.matchday_name}</span>
        <span className="schedule-date">{match.date}</span>
      </div>

      <div className="schedule-opponent">
        <span className="schedule-vs">vs</span>
        <TeamLogo logoUrl={opponent.logo_url} name={opponent.name} alt={opponent.name} className="schedule-opponent-logo" />
        <span className="schedule-opponent-name">{opponent.name}</span>
      </div>

      <div className="schedule-result">
        {isFinished ? (
          <>
            <span className="schedule-result-badge">{resultLetter}</span>
            <span className="schedule-score">{teamScore} - {opponentScore}</span>
          </>
        ) : (
          <span className="schedule-pending-label">{match.hour?.slice(0, 5)}</span>
        )}
      </div>

      <div className="schedule-meta">
        <span>{match.branch?.name}</span>
        <span>·</span>
        <span>{match.field?.name}</span>
      </div>
    </div>
  )
}

export default TeamScheduleRow
