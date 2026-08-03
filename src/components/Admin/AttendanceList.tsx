import AttendanceMatchCard from './AttendanceMatchCard'
import { sortPlayersByNumber } from '../../utils/sortPlayers'

function AttendanceList({
  matches = [],
  teams = [],
  teamsLoaded = false,
  attendanceByMatch = {},
  savingKey,
  onToggle
}) {
  if (!matches.length) {
    return <p className="attendance-list-empty">No hay partidos en esta jornada</p>
  }

  function getActivePlayers(teamId) {
    const team = teams.find(t => String(t.id) === String(teamId))
    return sortPlayersByNumber((team?.Player || []).filter(p => p.active))
  }

  return (
    <div className="attendance-list">
      {matches.map(match => (
        <AttendanceMatchCard
          key={match.id}
          match={match}
          localPlayers={getActivePlayers(match.local_team.id)}
          visitPlayers={getActivePlayers(match.visit_team.id)}
          teamsLoaded={teamsLoaded}
          attendanceForMatch={attendanceByMatch[match.id] || {}}
          savingKey={savingKey}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

export default AttendanceList
