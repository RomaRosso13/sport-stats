export const STAT_KEYS = ['touchdown', 'touchdown_pass', 'sacks', 'interceptions']

export const DEFAULT_STAT_LABELS = {
  touchdown: 'Touchdowns',
  touchdown_pass: 'Pases de Touchdown',
  sacks: 'Sacks',
  interceptions: 'Intercepciones'
}

export const STAT_LABEL_COLUMNS = {
  touchdown: 'stat_label_touchdown',
  touchdown_pass: 'stat_label_touchdown_pass',
  sacks: 'stat_label_sacks',
  interceptions: 'stat_label_interceptions'
}

// Devuelve { touchdown, touchdown_pass, sacks, interceptions } usando el
// nombre personalizado de la liga si existe, si no el default.
export function getStatLabels(league) {
  const labels = {}
  STAT_KEYS.forEach(key => {
    const custom = league?.[STAT_LABEL_COLUMNS[key]]
    labels[key] = (custom && custom.trim()) || DEFAULT_STAT_LABELS[key]
  })
  return labels
}
