// Jugador destacado de UN partido: suma las 4 categorías de stats que tuvo
// ese jugador en ese partido y se queda con el de mayor aportación total.
// Mismo criterio simple que ya se usa en otras vistas (radar del jugador,
// historial de partidos): una sola cifra de "impacto" combinando categorías
// que no son directamente comparables entre sí, pero sirve como heurística
// razonable de quién destacó.
export function calculateMatchMVP(matchStatsRows, statKeys) {
  const byPlayer = {}

  matchStatsRows.forEach(row => {
    const playerId = row.player?.id
    if (!playerId) return

    if (!byPlayer[playerId]) {
      byPlayer[playerId] = {
        id: playerId,
        name: row.player.name,
        photo: row.player.image_url,
        total: 0
      }
    }

    statKeys.forEach(key => {
      byPlayer[playerId].total += row[key] || 0
    })
  })

  const ranked = Object.values(byPlayer)
    .filter(player => player.total > 0)
    .sort((a, b) => b.total - a.total)

  return ranked[0] || null
}
