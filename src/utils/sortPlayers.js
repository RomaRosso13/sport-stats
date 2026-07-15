// Ordena jugadores por número de camiseta ascendente; los que no tienen
// número asignado quedan al final.
export function sortPlayersByNumber(players = []) {
  return [...players].sort((a, b) => {
    const aNum = a.number ?? Infinity
    const bNum = b.number ?? Infinity
    return aNum - bNum
  })
}
