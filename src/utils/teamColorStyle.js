import { isValidHex } from './colorMath'

// Variable CSS con el color del equipo (a tono completo, sin diluir), para
// una franja lateral y un anillo alrededor del logo. Si no hay color válido,
// regresa un objeto vacío y el CSS cae a su fallback (transparent) — un
// equipo sin color se ve exactamente igual que antes de esta función existir.
export function getTeamColorStyle(hex) {
  if (!isValidHex(hex)) return {}

  return {
    '--team-color': hex
  }
}
