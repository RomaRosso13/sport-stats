// Catálogo de criterios de desempate disponibles para la tabla de
// posiciones. `key` es lo único que se persiste (en League.tiebreaker_config,
// como un arreglo ordenado de { key, enabled }) — el label es solo para la
// UI de Configuración General.
export const TIEBREAKER_CRITERIA = [
  { key: 'wins', label: 'Partidos ganados' },
  { key: 'points', label: 'Puntos generales' },
  { key: 'scored', label: 'Puntos anotados' },
  { key: 'against', label: 'Puntos en contra' },
  { key: 'sum', label: 'Suma de anotados y en contra' },
  { key: 'average', label: 'Promedio de puntos' },
  { key: 'headToHead', label: 'Enfrentamiento directo' }
]

export const TIEBREAKER_LABELS = Object.fromEntries(TIEBREAKER_CRITERIA.map(c => [c.key, c.label]))

// Si una liga nunca configuró sus criterios, se usan todos, en este orden.
export const DEFAULT_TIEBREAKER_CONFIG = TIEBREAKER_CRITERIA.map(c => ({ key: c.key, enabled: true }))
