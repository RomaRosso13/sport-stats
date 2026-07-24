export const PLAYOFF_STAGES = ['Cuartos', 'Semifinal', 'Final']
export const SCRIMMAGE_TYPE = 'Scrimmage'

export const STAGE_LABELS = {
  Regular: 'Jornada Regular',
  Cuartos: 'Cuartos de Final',
  Semifinal: 'Semifinal',
  Final: 'Final',
  Scrimmage: 'Scrimmage'
}

export const STAGE_OPTIONS = [
  { value: 'Regular', label: 'Jornada Regular' },
  { value: 'Cuartos', label: 'Cuartos de Final' },
  { value: 'Semifinal', label: 'Semifinal' },
  { value: 'Final', label: 'Final' },
  { value: 'Scrimmage', label: 'Scrimmage' }
]

export function isPlayoffStage(type) {
  return PLAYOFF_STAGES.includes(type)
}

// Los scrimmages son partidos de práctica: se juegan y se pueden capturar
// estadísticas, pero no deben sumar a tabla de posiciones ni a los
// líderes/estadísticas de la temporada.
export function isScrimmage(type) {
  return type === SCRIMMAGE_TYPE
}
