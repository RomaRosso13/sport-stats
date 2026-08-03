import { isScrimmage } from './matchStages'

// Historial partido por partido de un equipo (mismo filtro que
// calculateTeamStats: ignora pendientes y scrimmages), ordenado por fecha.
// Sirve tanto para la gráfica de tendencia del perfil como para la tira de
// "forma reciente" del listado (tomando los últimos N de este mismo arreglo).
export function calculateTeamGameLog(name, matchdays) {
  const games = []

  matchdays.forEach(matchday => {
    matchday.games.forEach(match => {
      if (match.status === 'Pendiente') return
      if (isScrimmage(match.type)) return

      const esLocal = match.local_team.name === name
      const esVisitante = match.visit_team.name === name
      if (!esLocal && !esVisitante) return

      const pointsFor = esLocal ? match.local_points : match.visit_points
      const pointsAgainst = esLocal ? match.visit_points : match.local_points
      const opponent = esLocal ? match.visit_team.name : match.local_team.name

      games.push({
        id: match.id,
        date: match.date,
        matchdayName: matchday.name,
        opponent,
        pointsFor,
        pointsAgainst,
        result: pointsFor > pointsAgainst ? 'G' : pointsFor < pointsAgainst ? 'P' : 'E'
      })
    })
  })

  return games.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
}
