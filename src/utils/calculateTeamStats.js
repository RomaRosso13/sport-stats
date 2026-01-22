export function calculateTeamStats(name, matchdays) {
  const stats = {
    partidos: 0,
    ganados: 0,
    perdidos: 0,
    empatados: 0,
    puntosFavor: 0,
    puntosContra: 0
  }

  matchdays.forEach(matchday => {
    matchday.games.forEach(match => {
      if (match.status == 'Pendiente') return

      const esLocal = match.local_team.name === name
      const esVisitante = match.visit_team.name === name

      if (!esLocal && !esVisitante) return

      stats.partidos++

      const puntosEquipo = esLocal ? match.local_points : match.visit_points
      const puntosRival = esLocal ? match.visit_points : match.local_points

      stats.puntosFavor += puntosEquipo
      stats.puntosContra += puntosRival

      if (puntosEquipo > puntosRival) stats.ganados++
      else if (puntosEquipo < puntosRival) stats.perdidos++
      else stats.empatados++
    })
  })

  return stats
}
