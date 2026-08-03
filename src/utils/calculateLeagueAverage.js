import { isScrimmage } from './matchStages'

// Promedio de puntos anotados por equipo por partido en toda la categoría.
// A nivel liga, el promedio de "a favor" y "en contra" es el mismo número
// (cada punto que anota un equipo es un punto en contra del otro), así que
// sirve como única vara de comparación tanto para ofensiva como defensiva.
// Mismo filtro que calculateTeamStats (cuenta playoffs, no pendientes ni
// scrimmages) para que la comparación sea consistente con el resto del perfil.
export function calculateLeagueAverage(matches) {
  let teamGames = 0
  let totalPoints = 0

  matches.forEach(match => {
    if (match.status === 'Pendiente') return
    if (isScrimmage(match.type)) return

    teamGames += 2
    totalPoints += match.local_points + match.visit_points
  })

  return teamGames > 0 ? Number((totalPoints / teamGames).toFixed(1)) : 0
}
