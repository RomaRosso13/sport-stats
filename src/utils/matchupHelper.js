// Dado un equipo y el historial de partidos de su categoría, separa al resto
// de los equipos en "ya se enfrentaron" y "sugerencias" (aún no se enfrentan).
// Las sugerencias se ordenan por menos partidos jugados en total, para ayudar
// a mantener la jornada pareja (los equipos con menos partidos aparecen primero).
export function getMatchupInfo(teams, matches, teamId) {
  if (!teamId) return null

  const selectedTeam = teams.find(t => String(t.id) === String(teamId))
  if (!selectedTeam) return null

  const gamesPlayedByTeam = {}
  const gamesAgainstOpponent = {}

  matches.forEach(m => {
    const localId = String(m.local_team_id)
    const visitId = String(m.visit_team_id)

    gamesPlayedByTeam[localId] = (gamesPlayedByTeam[localId] || 0) + 1
    gamesPlayedByTeam[visitId] = (gamesPlayedByTeam[visitId] || 0) + 1

    if (localId === String(teamId)) {
      gamesAgainstOpponent[visitId] = (gamesAgainstOpponent[visitId] || 0) + 1
    }
    if (visitId === String(teamId)) {
      gamesAgainstOpponent[localId] = (gamesAgainstOpponent[localId] || 0) + 1
    }
  })

  const otherTeams = teams.filter(t => String(t.id) !== String(teamId))

  const played = otherTeams
    .filter(t => gamesAgainstOpponent[String(t.id)] > 0)
    .map(t => ({ ...t, timesPlayed: gamesAgainstOpponent[String(t.id)] }))
    .sort((a, b) => b.timesPlayed - a.timesPlayed)

  const suggested = otherTeams
    .filter(t => !gamesAgainstOpponent[String(t.id)])
    .map(t => ({ ...t, gamesPlayed: gamesPlayedByTeam[String(t.id)] || 0 }))
    .sort((a, b) => a.gamesPlayed - b.gamesPlayed)

  return { team: selectedTeam, played, suggested }
}
