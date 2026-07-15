export function classifyTopPlayersByStats( stats, statKeys = [], limit = 3) {
  if (!Array.isArray(stats) || statKeys.length === 0) return {}

  const result = {}

  statKeys.forEach(statKey => {
    const map = {}

    stats.forEach(row => {
      const value = row[statKey] || 0
      if (value === 0) return

      const playerId = row.player?.id
      if (!playerId) return

      if (!map[playerId]) {
        map[playerId] = {
          id: playerId,
          name: row.player.name,
          number: row.player.number ?? null,
          photo: row.player.image_url ?? null,
          team: row.team?.name ?? null,
          teamId: row.team?.id ?? null,
          teamLogo: row.team?.logo_url ?? null,
          [statKey]: 0
        }
      }

      map[playerId][statKey] += value
    })

    const top = Object.values(map)
      .sort((a, b) => b[statKey] - a[statKey])
      .slice(0, limit)

    result[statKey] = top
  })

  return result
}
