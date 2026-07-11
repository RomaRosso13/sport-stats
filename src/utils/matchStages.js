export const PLAYOFF_STAGES = ['Cuartos', 'Semifinal', 'Final']

export const STAGE_LABELS = {
  Regular: 'Jornada Regular',
  Cuartos: 'Cuartos de Final',
  Semifinal: 'Semifinal',
  Final: 'Final'
}

export const STAGE_OPTIONS = [
  { value: 'Regular', label: 'Jornada Regular' },
  { value: 'Cuartos', label: 'Cuartos de Final' },
  { value: 'Semifinal', label: 'Semifinal' },
  { value: 'Final', label: 'Final' }
]

export function isPlayoffStage(type) {
  return PLAYOFF_STAGES.includes(type)
}
