export function hexToRgb(hex) {
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

export function darken(rgb, amount) {
  const shade = c => Math.round(c * (1 - amount))
  return `rgb(${shade(rgb.r)}, ${shade(rgb.g)}, ${shade(rgb.b)})`
}

export function mixWithWhite(rgb, amount) {
  const tint = c => Math.round(c + (255 - c) * amount)
  return `rgb(${tint(rgb.r)}, ${tint(rgb.g)}, ${tint(rgb.b)})`
}

export function isValidHex(hex) {
  return typeof hex === 'string' && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)
}
