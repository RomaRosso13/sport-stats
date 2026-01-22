export function getRecentResults(matchdays, limit = 4) {
  return matchdays
    .flatMap(j =>
      j.games
        .filter(p => p.status == 'Terminado')
        .map(p => ({
          ...p,
          date: j.date,
          matchday: j.name
        }))
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 3)
}
