// Historial partido por partido de un jugador: IndividualStats trae una fila
// por jugador por partido, así que se agrupa por match_id y se suma cada
// estadística (normalmente una sola fila por partido, pero se suma por si
// hubiera más de una). Sirve tanto para la gráfica de progreso como para el
// historial de partidos del perfil.
export function calculatePlayerGameLog(playerId, statsRows, statKeys) {
  const byMatch = {}

  statsRows
    .filter(row => String(row.player?.id) === String(playerId))
    .forEach(row => {
      const matchId = row.match_id

      if (!byMatch[matchId]) {
        const match = row.match || {}
        const isLocal = String(match.local_team?.id) === String(row.team?.id)
        const opponent = isLocal ? match.visit_team : match.local_team

        byMatch[matchId] = {
          id: matchId,
          date: match.date || null,
          opponent: opponent?.name || null,
          opponentLogo: opponent?.logo_url || null,
          total: 0
        }
        statKeys.forEach(key => { byMatch[matchId][key] = 0 })
      }

      statKeys.forEach(key => {
        const value = row[key] || 0
        byMatch[matchId][key] += value
        byMatch[matchId].total += value
      })
    })

  return Object.values(byMatch).sort((a, b) => (a.date || '').localeCompare(b.date || ''))
}
