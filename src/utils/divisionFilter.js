export function filterTeamsByDivision(teams, divisionId) {
  if (!divisionId) return teams
  return teams.filter(t => String(t.division_id) === String(divisionId))
}

// Para filas de IndividualStats, que traen el equipo embebido como `row.team`.
export function filterStatsByDivision(rows, divisionId) {
  if (!divisionId) return rows
  return rows.filter(row => String(row.team?.division_id) === String(divisionId))
}
