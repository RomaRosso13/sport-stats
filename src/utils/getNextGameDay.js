export function getNextGameDay(matchdays, limit = 8) {
  if (!matchdays || matchdays.length === 0) return null

  const matchdayPending = matchdays.find(md =>
    md.games?.some(game => game.status === 'Pendiente')
  )

  if (!matchdayPending) return null

  return {
    id: matchdayPending.id,
    name: matchdayPending.name,
    date: matchdayPending.date,
    games: matchdayPending.games
      .filter(game => game.status === 'Pendiente')
      .slice(0, 3)
  }
}
