const DEFAULT_ACCENT = '#2563eb'

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean

  const value = parseInt(full, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  }
}

function darken(rgb, amount) {
  const shade = c => Math.round(c * (1 - amount))
  return `rgb(${shade(rgb.r)}, ${shade(rgb.g)}, ${shade(rgb.b)})`
}

function mixWithWhite(rgb, amount) {
  const tint = c => Math.round(c + (255 - c) * amount)
  return `rgb(${tint(rgb.r)}, ${tint(rgb.g)}, ${tint(rgb.b)})`
}

// Deriva toda la paleta de acento (hover, fondos suaves, bordes, rgba)
// a partir de un solo color de liga, y la aplica como variables CSS globales.
export function applyAccentColor(hex) {
  const isValidHex = typeof hex === 'string' && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)
  const color = isValidHex ? hex : DEFAULT_ACCENT
  const rgb = hexToRgb(color)
  const root = document.documentElement.style

  root.setProperty('--accent', color)
  root.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  root.setProperty('--accent-dark', darken(rgb, 0.18))
  root.setProperty('--accent-soft', mixWithWhite(rgb, 0.92))
  root.setProperty('--accent-soft-2', mixWithWhite(rgb, 0.85))
  root.setProperty('--accent-border-soft', mixWithWhite(rgb, 0.68))
}
