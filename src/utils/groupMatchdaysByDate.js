// Cada jornada es compartida por todas las categorías activas: se crea un
// renglón de Matchday por categoría (mismo nombre y fecha) para que cada
// categoría tenga su propio matchday_id al que asociar sus partidos, pero
// desde la UI se ve y se edita como una sola jornada.
export function groupMatchdaysByDate(matchdaysData) {
  const byDate = new Map()

  matchdaysData.forEach(md => {
    if (!byDate.has(md.date)) {
      byDate.set(md.date, { id: md.date, date: md.date, name: md.name, sortOrder: md.sort_order ?? null, matchdaysByCategory: {} })
    }
    byDate.get(md.date).matchdaysByCategory[md.category_id] = md
  })

  // Si alguna jornada ya tiene un orden explícito (el usuario reordenó al
  // menos una vez), ese orden manda; las que no tienen se acomodan por
  // fecha entre ellas, al final.
  return Array.from(byDate.values()).sort((a, b) => {
    if (a.sortOrder != null && b.sortOrder != null) return a.sortOrder - b.sortOrder
    if (a.sortOrder != null) return -1
    if (b.sortOrder != null) return 1
    return a.date.localeCompare(b.date)
  })
}
