export const OFFENSE_STAT_KEYS = ['touchdown', 'touchdown_pass']
export const DEFENSE_STAT_KEYS = ['sacks', 'interceptions']

// Suma simple de stats sobre un arreglo de filas de IndividualStats ya
// filtradas (por ejemplo, las de un solo equipo).
export function sumTeamStats(rows, statKeys) {
  const totals = {}
  statKeys.forEach(key => { totals[key] = 0 })

  rows.forEach(row => {
    statKeys.forEach(key => { totals[key] += row[key] || 0 })
  })

  return totals
}

// Máximo por stat entre todos los equipos de la categoría, agrupando las
// filas de IndividualStats por team_id (mismo patrón que
// classifyTopPlayersByStats, pero agrupado por equipo en vez de jugador).
// Sirve para mostrar la barra de un equipo como proporción del líder de la liga.
export function calculateLeagueMaxes(rows, statKeys) {
  const totalsByTeam = {}

  rows.forEach(row => {
    const teamId = row.team?.id
    if (teamId == null) return

    if (!totalsByTeam[teamId]) {
      totalsByTeam[teamId] = {}
      statKeys.forEach(key => { totalsByTeam[teamId][key] = 0 })
    }

    statKeys.forEach(key => { totalsByTeam[teamId][key] += row[key] || 0 })
  })

  const maxes = {}
  statKeys.forEach(key => {
    const values = Object.values(totalsByTeam).map(t => t[key] || 0)
    maxes[key] = Math.max(1, ...values)
  })

  return maxes
}
