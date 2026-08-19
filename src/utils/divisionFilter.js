// Sin `divisionId` (vista "General") no se filtra nada — se ve exactamente
// igual que en una liga que no usa divisiones. Con un `divisionId`, solo
// cuentan los partidos donde AMBOS equipos son de esa división (un partido
// contra un equipo sin asignar o de otra división no se cuenta ahí).
export function filterMatchesByDivision(matches, divisionId) {
  if (!divisionId) return matches
  return matches.filter(m =>
    String(m.local_team?.division_id) === String(divisionId) &&
    String(m.visit_team?.division_id) === String(divisionId)
  )
}

export function filterTeamsByDivision(teams, divisionId) {
  if (!divisionId) return teams
  return teams.filter(t => String(t.division_id) === String(divisionId))
}

// Para filas de IndividualStats, que traen el equipo embebido como `row.team`.
export function filterStatsByDivision(rows, divisionId) {
  if (!divisionId) return rows
  return rows.filter(row => String(row.team?.division_id) === String(divisionId))
}
