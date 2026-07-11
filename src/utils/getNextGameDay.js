export function getNextGameDay(matchdays,) {
  if (!matchdays || matchdays.length === 0) return null

  // 1. Ordenar jornadas por fecha ASC (próximas primero)
  const sortedMatchdays = [...matchdays].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  const games = []
  let firstMatchday = null

  // 2. Recorrer jornadas hacia adelante
  for (const matchday of sortedMatchdays) {
    const pendingGames = matchday.games
      ?.filter(game => game.status === 'Pendiente') || []

    if (pendingGames.length > 0 && !firstMatchday) {
      firstMatchday = matchday
    }

    games.push(
      ...pendingGames.map(game => ({
        ...game,
        matchday: matchday.name,
        date: matchday.date
      }))
    )

    if (games.length >= 8) break
  }

  if (!firstMatchday || games.length === 0) return null

  return {
    id: firstMatchday.id,
    name: firstMatchday.name,
    date: firstMatchday.date,
    games: games.slice(0, 8)
  }
}
