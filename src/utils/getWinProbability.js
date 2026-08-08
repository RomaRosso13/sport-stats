// Estima la fuerza de un equipo a partir de su historial en la liga (puntos
// de liga sobre puntos posibles) — no es un modelo estadístico real, solo
// una referencia visual basada en su récord de la temporada.
function teamStrength(row) {
  if (!row || !row.pj) return 0.5
  return row.puntos / (row.pj * 2)
}

export function getWinProbabilities(localRow, visitRow) {
  const local = teamStrength(localRow)
  const visit = teamStrength(visitRow)
  const total = local + visit

  if (total === 0) return { local: 50, visit: 50 }

  const localPct = Math.round((local / total) * 100)
  return { local: localPct, visit: 100 - localPct }
}

// Verde para el lado favorito, rojo para el lado desfavorecido — sin favorito
// claro (empate de probabilidad) se deja en gris neutro.
export function getWinProbColors(localPct, visitPct) {
  if (localPct === visitPct) {
    return { local: 'var(--text-faint)', visit: 'var(--text-faint)' }
  }
  return localPct > visitPct
    ? { local: 'var(--status-win-text)', visit: 'var(--status-loss-text)' }
    : { local: 'var(--status-loss-text)', visit: 'var(--status-win-text)' }
}

// Para partidos ya jugados: en vez de una probabilidad "antes del partido",
// qué porcentaje del total de puntos anotados metió cada equipo — la misma
// barra, pero mirando hacia atrás en vez de hacia adelante.
export function getScoreDominance(localPoints, visitPoints) {
  const total = (localPoints || 0) + (visitPoints || 0)
  if (total === 0) return { local: 50, visit: 50 }

  const localPct = Math.round((localPoints / total) * 100)
  return { local: localPct, visit: 100 - localPct }
}
