// Combina el ranking de cada categoría de stat para encontrar a los jugadores
// más completos (no solo el líder de una sola categoría). Solo califican
// jugadores presentes en al menos `minCategories` tablas, para no premiar a un
// especialista de una sola estadística por encima de un jugador más completo.
export function getMostCompletePlayers(leaderboards, statKeys, { minCategories = 2, limit = 5 } = {}) {
  const playersByStat = {}

  statKeys.forEach(key => {
    const ranked = leaderboards[key] || []
    ranked.forEach((player, index) => {
      if (!playersByStat[player.id]) {
        playersByStat[player.id] = { ...player, ranks: {} }
      }
      playersByStat[player.id].ranks[key] = index + 1
    })
  })

  const qualifying = Object.values(playersByStat).filter(
    player => Object.keys(player.ranks).length >= minCategories
  )

  qualifying.forEach(player => {
    const ranks = Object.values(player.ranks)
    player.averageRank = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length
    player.categoriesCount = ranks.length
  })

  return qualifying
    .sort((a, b) => a.averageRank - b.averageRank || b.categoriesCount - a.categoriesCount)
    .slice(0, limit)
}
