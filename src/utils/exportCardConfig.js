// Configuración compartida por todas las tarjetas exportables (tabla de
// posiciones, estadísticas individuales, y las que sigan).

// Tamaño "lógico" en px de la tarjeta — el canvas real se dibuja a esto
// multiplicado por EXPORT_SCALE. Como se dibuja a mano con Canvas 2D (no
// con html2canvas clonando el DOM), subir el scale no tiene costo/riesgo
// — es solo más píxeles que rellenar.
export const EXPORT_CARD_BASE = 360
export const EXPORT_SCALE = 3 // 360 * 3 = 1080, resolución estándar para redes

export const EXPORT_FORMATS = {
  square: { width: EXPORT_CARD_BASE, height: EXPORT_CARD_BASE, label: 'Cuadrado' },
  story: { width: EXPORT_CARD_BASE, height: Math.round(EXPORT_CARD_BASE * 16 / 9), label: 'Historia' }
}

// Con muchas filas, un cuadrado obliga a letra minúscula — a partir de
// cierto tamaño se sugiere el formato vertical, sin forzarlo.
export function getRecommendedFormat(rowCount) {
  return rowCount > 8 ? 'story' : 'square'
}

export const TOP_N_OPTIONS = [
  { value: 5, label: 'Top 5' },
  { value: 10, label: 'Top 10' },
  { value: null, label: 'Todos' }
]

// Las estadísticas individuales solo admiten Top 5 / Top 10 (sin "Todos"):
// con muchos jugadores el nombre + equipo en dos líneas deja de caber bien.
export const PLAYER_TOP_N_OPTIONS = [
  { value: 5, label: 'Top 5' },
  { value: 10, label: 'Top 10' }
]

export function getVisibleRows(rows, topN) {
  if (!topN) return rows
  return rows.slice(0, topN)
}
