import { hexToRgb, darken, mixWithWhite, mixWithDark, isValidHex } from './colorMath'

const DEFAULT_ACCENT = '#2563eb'

// Se recuerda el último color aplicado para poder recalcular la paleta
// cuando cambia el tema (ThemeContext llama a reapplyAccentColor), sin
// depender de que LeagueContext vuelva a disparar su propio efecto.
let currentColor = DEFAULT_ACCENT

// Deriva toda la paleta de acento (hover, fondos suaves, bordes, rgba)
// a partir de un solo color de liga, y la aplica como variables CSS globales.
// Los tonos "suaves" se mezclan hacia blanco en modo claro y hacia el fondo
// oscuro de superficie en modo noche, para que no se vean lavados/blancos.
export function applyAccentColor(hex) {
  currentColor = isValidHex(hex) ? hex : DEFAULT_ACCENT
  render(currentColor)
}

export function reapplyAccentColor() {
  render(currentColor)
}

function render(color) {
  const rgb = hexToRgb(color)
  const root = document.documentElement.style
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  root.setProperty('--accent', color)
  root.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  root.setProperty('--accent-dark', isDark ? mixWithWhite(rgb, 0.35) : darken(rgb, 0.18))
  root.setProperty('--accent-soft', isDark ? mixWithDark(rgb, 0.75) : mixWithWhite(rgb, 0.92))
  root.setProperty('--accent-soft-2', isDark ? mixWithDark(rgb, 0.6) : mixWithWhite(rgb, 0.85))
  root.setProperty('--accent-border-soft', isDark ? mixWithWhite(rgb, 0.3) : mixWithWhite(rgb, 0.68))
}
