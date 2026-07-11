export function getRecentResults(matchdays) {
  if (!matchdays || matchdays.length === 0) return []

  // 1. Ordenar jornadas por fecha DESC
  const sortedMatchdays = [...matchdays].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  const results = []

  // 2. Recorrer jornadas desde la más reciente
  for (const matchday of sortedMatchdays) {
    const finishedGames = matchday.games
      .filter(g => g.status === 'Terminado')
      .map(g => ({
        ...g,
        date: matchday.date,
        matchday: matchday.name
      }))

    results.push(...finishedGames)

    // 3. Cortar cuando llegamos al límite
    if (results.length >= 8) break
  }

  return results.slice(0, 8)
}
