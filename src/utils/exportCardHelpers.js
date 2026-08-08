import { getInitials } from './initials'

// Piezas de dibujo compartidas entre las tarjetas exportables (tabla de
// posiciones, estadísticas individuales, y las que sigan) — todo Canvas 2D
// nativo, sin pasar por html2canvas. html2canvas necesita clonar la página
// entera dentro de un <iframe> oculto antes de poder rasterizar nada, y ese
// paso se cuelga en Safari sin avanzar ni fallar. Dibujando a mano no hay
// DOM que clonar — son solo instrucciones de dibujo y cargas de imagen
// normales, iguales en cualquier navegador.

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

export const GOLD = { from: '#fef9c3', to: '#fde68a', text: '#78350f' }
export const SILVER = { from: '#f1f5f9', to: '#dbe2ea', text: '#334155' }
export const BRONZE = { from: '#fed7aa', to: '#fdba74', text: '#7c2d12' }

export function medalStyle(rank, showMedals) {
  if (!showMedals) return null
  if (rank === 1) return GOLD
  if (rank === 2) return SILVER
  if (rank === 3) return BRONZE
  return null
}

export function truncateToWidth(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let end = text.length
  while (end > 1 && ctx.measureText(text.slice(0, end) + '…').width > maxWidth) end--
  return text.slice(0, end) + '…'
}

export function loadImage(url) {
  return new Promise(resolve => {
    if (!url) { resolve(null); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export async function loadBrandImages(league) {
  const [leagueLogoImg, flagstatsImg] = await Promise.all([
    loadImage(league?.image_url),
    loadImage('/icons/icon-192.png')
  ])
  return { leagueLogoImg, flagstatsImg }
}

export function drawCover(ctx, img, x, y, w, h) {
  const boxRatio = w / h
  const imgRatio = img.width / img.height
  let sx, sy, sw, sh
  if (imgRatio > boxRatio) {
    sh = img.height
    sw = sh * boxRatio
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / boxRatio
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

export function drawImageContain(ctx, img, cx, cy, size) {
  const imgRatio = img.width / img.height
  let dw, dh
  if (imgRatio > 1) { dh = size; dw = size * imgRatio } else { dw = size; dh = size / imgRatio }
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh)
}

// Path de rectángulo redondeado dibujado a mano — ctx.roundRect() es
// reciente (Safari solo lo soporta desde la versión 16.4) y ya nos costó
// caro asumir soporte parejo entre navegadores una vez en esta función.
export function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export function clipToRoundedCard(ctx, width, height, radius = 26) {
  roundedRectPath(ctx, 0, 0, width, height, radius)
  ctx.clip()
}

export function drawCircleImage(ctx, img, cx, cy, r) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  drawImageContain(ctx, img, cx, cy, r * 2)
  ctx.restore()
}

export function drawRoundedImage(ctx, img, x, y, size, radius) {
  ctx.save()
  roundedRectPath(ctx, x, y, size, size, radius)
  ctx.clip()
  drawImageContain(ctx, img, x + size / 2, y + size / 2, size)
  ctx.restore()
}

// Círculo avatar con caída a iniciales si no hay imagen — mismo patrón que
// ya usan TeamLogo/PlayerAvatar en el resto de la app.
export function drawAvatarCircle(ctx, { img, name, cx, cy, r }) {
  if (img) {
    drawCircleImage(ctx, img, cx, cy, r)
  } else {
    ctx.fillStyle = '#64748b'
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = `800 8px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(getInitials(name), cx, cy + 3)
  }
}

// Logo del enfrentamiento (partido destacado) sin marco ni recorte — el
// logo se ve tal cual, solo más grande y con una ligera inclinación hacia
// el centro del "vs", más una sombra de contacto para darle peso.
export function drawBattleLogo(ctx, { img, name, cx, cy, size, rotation = 0, color }) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 14

  if (img) {
    drawImageContain(ctx, img, 0, 0, size)
  } else {
    roundedRectPath(ctx, -size / 2, -size / 2, size, size, size * 0.16)
    ctx.fillStyle = color
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffffff'
    ctx.font = `900 ${Math.round(size * 0.42)}px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(getInitials(name), 0, size * 0.16)
  }

  ctx.restore()
}

// Ráfaga de líneas de impacto detrás de la insignia "VS" — el toque final
// de energía/choque que separa esto de un simple círculo con texto.
export function drawImpactBurst(ctx, cx, cy, r, color) {
  const lines = 8
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.55
  for (let i = 0; i < lines; i++) {
    const angle = (i / lines) * Math.PI * 2
    const x1 = cx + Math.cos(angle) * (r + 4)
    const y1 = cy + Math.sin(angle) * (r + 4)
    const x2 = cx + Math.cos(angle) * (r + 12)
    const y2 = cy + Math.sin(angle) * (r + 12)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.restore()
}

// El path original vive en un viewBox de 0-20 (mismo diseño que se usó en
// el menú de navegación) — se escala/traslada al tamaño real pedido.
export function withIconTransform(ctx, cx, cy, size, draw) {
  ctx.save()
  ctx.translate(cx - size / 2, cy - size / 2)
  ctx.scale(size / 20, size / 20)
  draw()
  ctx.restore()
}

export function drawCrown(ctx, cx, cy, size) {
  withIconTransform(ctx, cx, cy, size, () => {
    ctx.fillStyle = '#b45309'
    ctx.beginPath()
    ctx.moveTo(4, 15.2)
    ctx.lineTo(16, 15.2)
    ctx.lineTo(17.1, 7.8)
    ctx.lineTo(13.1, 10.4)
    ctx.lineTo(10, 6)
    ctx.lineTo(6.9, 10.4)
    ctx.lineTo(2.9, 7.8)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(4, 15.2, 12, 1.6)
  })
}

const STAR_POINTS = [[10, 2], [12.2, 7.3], [18, 7.7], [13.5, 11.4], [15, 17.3], [10, 13.9], [5, 17.3], [6.5, 11.4], [2, 7.7], [7.8, 7.3]]

export function drawMedal(ctx, cx, cy, size, color) {
  withIconTransform(ctx, cx, cy, size, () => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(STAR_POINTS[0][0], STAR_POINTS[0][1])
    for (let i = 1; i < STAR_POINTS.length; i++) ctx.lineTo(STAR_POINTS[i][0], STAR_POINTS[i][1])
    ctx.closePath()
    ctx.fill()
  })
}

// Tira de rango en diagonal (paralelogramo) en vez de un número plano
// centrado — le da un corte angular a cada fila en lugar del bloque
// perfectamente rectangular.
export const RANK_TAB_W = 30
export const RANK_SKEW = 9

export function drawRankBadge(ctx, x, y, w, h, rgb, rank) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w - RANK_SKEW, y + h)
  ctx.lineTo(x, y + h)
  ctx.closePath()
  ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 15px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(String(rank), x + w / 2 - RANK_SKEW / 2, y + h / 2 + 5)
}

// Degradado oscuro + resplandor diagonal del color elegido (mismo espíritu
// que el header de la app), o la foto subida con overlay oscuro automático
// para que el texto blanco siga siendo legible sin importar la foto.
export function drawCardBackground(ctx, { width, height, backgroundMode, bgImg, rgb }) {
  if (backgroundMode === 'image' && bgImg) {
    drawCover(ctx, bgImg, 0, 0, width, height)
    ctx.fillStyle = 'rgba(10,14,22,0.55)'
    ctx.fillRect(0, 0, width, height)
  } else if (backgroundMode === 'image') {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
  } else {
    const dark = ctx.createLinearGradient(0, 0, width * 0.3, height)
    dark.addColorStop(0, '#0f172a')
    dark.addColorStop(0.6, '#111827')
    dark.addColorStop(1, '#111827')
    ctx.fillStyle = dark
    ctx.fillRect(0, 0, width, height)

    const glow = ctx.createLinearGradient(0, 0, width * 0.85, height * 0.5)
    glow.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.55)`)
    glow.addColorStop(0.45, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)
  }

  // Corte diagonal decorativo detrás del encabezado — rompe la sensación
  // de "cuadrícula plana" antes de llegar al texto.
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(width, 0)
  ctx.lineTo(width, 78)
  ctx.lineTo(0, 52)
  ctx.closePath()
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.16)`
  ctx.fill()
  ctx.restore()
}

// Logo de la liga + nombre/título/subtítulo a la izquierda, marca de agua
// de FlagStats arriba a la derecha alineada con el título.
export function drawCardHeader(ctx, { width, leagueName, leagueLogoImg, flagstatsImg, title, subtitle }) {
  if (leagueLogoImg) {
    drawRoundedImage(ctx, leagueLogoImg, 20, 20, 34, 9)
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.fillRect(20, 20, 34, 34)
    ctx.fillStyle = '#ffffff'
    ctx.font = `800 15px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText((leagueName || '').charAt(0).toUpperCase(), 37, 42)
  }

  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = `800 11px ${FONT}`
  ctx.fillText((leagueName || '').toUpperCase(), 64, 32)

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 17px ${FONT}`
  ctx.fillText(title, 64, 49)

  if (subtitle) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = `700 10.5px ${FONT}`
    ctx.fillText(subtitle, 64, 61)
  }

  const fsBoxSize = 28
  const fsBoxX = width - 20 - fsBoxSize
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  roundedRectPath(ctx, fsBoxX, 20, fsBoxSize, fsBoxSize, 8)
  ctx.fill()
  if (flagstatsImg) {
    ctx.save()
    roundedRectPath(ctx, fsBoxX, 20, fsBoxSize, fsBoxSize, 8)
    ctx.clip()
    drawImageContain(ctx, flagstatsImg, fsBoxX + fsBoxSize / 2, 20 + fsBoxSize / 2, fsBoxSize - 6)
    ctx.restore()
  }
}

export function drawRowsPanelBackground(ctx, { x, y, w, h, rgb }) {
  roundedRectPath(ctx, x, y, w, h, 18)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fill()
  roundedRectPath(ctx, x, y, w, h, 18)
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`
  ctx.fill()
}
