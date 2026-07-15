import MatchRow from './MatchRow'
import { sortPlayersByNumber } from '../../utils/sortPlayers'

function MatchList({
  matches = [],
  onChange,
  teams = [],
  statsDraft = {},
  statsTotals = {},
  statsByMatch = {},
  onAddStatEntry,
  onRemoveStatEntry,
  onPlayerCreated,
  isStaff = false
}) {
  if (!matches.length) {
    return <p className="match-list-empty">No hay partidos en esta jornada</p>
  }

  function getActivePlayers(teamId) {
    const team = teams.find(t => String(t.id) === String(teamId))
    return sortPlayersByNumber((team?.Player || []).filter(p => p.active))
  }

  return (
    <div className="match-list">
      {matches.map(match => (
        <MatchRow
          key={match.id}
          match={match}
          onChange={onChange}
          localPlayers={getActivePlayers(match.local_team.id)}
          visitPlayers={getActivePlayers(match.visit_team.id)}
          statsEntries={statsDraft[match.id] || []}
          statsTotals={statsTotals}
          savedStats={statsByMatch[match.id] || []}
          onAddStatEntry={onAddStatEntry}
          onRemoveStatEntry={onRemoveStatEntry}
          onPlayerCreated={onPlayerCreated}
          isStaff={isStaff}
        />
      ))}
    </div>
  )
}

export default MatchList
