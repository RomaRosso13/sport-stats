export function formatRowStat(row, statKey) {
  if (statKey === 'diff') {
    return row.difference > 0 ? `+${row.difference}` : `${row.difference}`
  }
  // 'record' (default) — también sirve de fallback si 'form' no tiene partidos
  return row.e > 0 ? `${row.g}-${row.e}-${row.p}` : `${row.g}-${row.p}`
}
