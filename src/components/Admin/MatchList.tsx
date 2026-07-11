import MatchRow from './MatchRow'

function MatchList({
  matches = [],
  onChange,
  teams = [],
  statsDraft = {},
  statsTotals = {},
  onAddStatEntry,
  onRemoveStatEntry
}) {
  if (!matches.length) {
    return <p className="match-list-empty">No hay partidos en esta jornada</p>
  }

  function getActivePlayers(teamId) {
    const team = teams.find(t => String(t.id) === String(teamId))
    return (team?.Player || []).filter(p => p.active)
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
          onAddStatEntry={onAddStatEntry}
          onRemoveStatEntry={onRemoveStatEntry}
        />
      ))}
    </div>
  )
}

export default MatchList
