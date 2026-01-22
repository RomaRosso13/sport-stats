export function getDefaultSeason(temporadas) {
  const temporadasArray = Object.values(temporadas)

  const activas = temporadasArray.filter(t => t.status === 'active')

  if (activas.length > 0) {
    return activas.sort((a, b) => b.year - a.year)[0]
  }

  return temporadasArray.sort((a, b) => b.year - a.year)[0]
}
