// Paleta fija para diferenciar divisiones a simple vista en la vista
// "General" de la tabla — se asigna por orden de la lista, así que es
// consistente mientras no cambie el orden de las divisiones.
const DIVISION_PALETTE = ['#d97706', '#0891b2', '#7c3aed', '#dc2626', '#059669', '#db2777']

export function getDivisionColorMap(divisions) {
  const map = {}
  divisions.forEach((division, index) => {
    map[division.id] = DIVISION_PALETTE[index % DIVISION_PALETTE.length]
  })
  return map
}
