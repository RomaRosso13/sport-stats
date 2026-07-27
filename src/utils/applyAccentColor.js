import { hexToRgb, darken, mixWithWhite, isValidHex } from './colorMath'

const DEFAULT_ACCENT = '#2563eb'

// Deriva toda la paleta de acento (hover, fondos suaves, bordes, rgba)
// a partir de un solo color de liga, y la aplica como variables CSS globales.
export function applyAccentColor(hex) {
  const color = isValidHex(hex) ? hex : DEFAULT_ACCENT
  const rgb = hexToRgb(color)
  const root = document.documentElement.style

  root.setProperty('--accent', color)
  root.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  root.setProperty('--accent-dark', darken(rgb, 0.18))
  root.setProperty('--accent-soft', mixWithWhite(rgb, 0.92))
  root.setProperty('--accent-soft-2', mixWithWhite(rgb, 0.85))
  root.setProperty('--accent-border-soft', mixWithWhite(rgb, 0.68))
}
