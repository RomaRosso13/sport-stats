import { hexToRgb } from './colorMath'
import { EXPORT_FORMATS } from './exportCardConfig'
import {
  FONT, truncateToWidth, loadImage, loadBrandImages,
  roundedRectPath, clipToRoundedCard, drawAvatarCircle,
  drawBattleLogo, drawImpactBurst,
  drawCardBackground, drawCardHeader, drawRowsPanelBackground
} from './exportCardHelpers'

// Alto fijo del "hero" del partido destacado — independiente del formato,
// para que el enfrentamiento se vea siempre igual de grande sin importar
// cuántas filas quepan debajo.
const HERO_H = 160

function drawFeaturedMatchHero(ctx, { x, y, w, rgb, game, logoMap }) {
  const isFinished = game.status === 'Terminado'
  const localWon = isFinished && game.local_points > game.visit_points
  const visitWon = isFinished && game.visit_points > game.local_points

  roundedRectPath(ctx, x, y, w, HERO_H, 16)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fill()

  // Corte diagonal "de choque" — dos tonos que se encuentran al centro,
  // como si ambos lados vinieran chocando desde extremos opuestos.
  ctx.save()
  roundedRectPath(ctx, x, y, w, HERO_H, 16)
  ctx.clip()
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.22)`
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w * 0.56, y)
  ctx.lineTo(x + w * 0.44, y + HERO_H)
  ctx.lineTo(x, y + HERO_H)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(15,23,42,0.14)'
  ctx.beginPath()
  ctx.moveTo(x + w * 0.56, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w, y + HERO_H)
  ctx.lineTo(x + w * 0.44, y + HERO_H)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  ctx.textAlign = 'left'
  ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`
  ctx.font = `800 10px ${FONT}`
  ctx.fillText('⚡ PARTIDO DESTACADO', x + 14, y + 18)

  const logoSize = 76
  const vsR = 16
  const cy = y + 18 + 16 + logoSize / 2
  const centerX = x + w / 2
  const gap = 6
  const localCx = centerX - (logoSize / 2 + gap)
  const visitCx = centerX + (logoSize / 2 + gap)
  const accent = `rgb(${rgb.r},${rgb.g},${rgb.b})`

  // Logos sin marco, más grandes, ligeramente inclinados hacia el centro.
  drawBattleLogo(ctx, { img: logoMap[game.local_team.logo_url], name: game.local_team.name, cx: localCx, cy, size: logoSize, rotation: -0.05, color: accent })
  drawBattleLogo(ctx, { img: logoMap[game.visit_team.logo_url], name: game.visit_team.name, cx: visitCx, cy, size: logoSize, rotation: 0.05, color: accent })

  drawImpactBurst(ctx, centerX, cy, vsR, accent)

  // Insignia "VS" encima de ambos logos, traslapándolos un poco.
  ctx.beginPath()
  ctx.arc(centerX, cy, vsR, 0, Math.PI * 2)
  ctx.fillStyle = accent
  ctx.fill()
  ctx.lineWidth = 2.5
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = `800 12px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('VS', centerX, cy + 4)

  // Los nombres se separan más que los logos (que están pegados a
  // propósito para el efecto de choque) — si se centraran justo debajo de
  // cada logo, nombres largos se tocarían en el medio.
  const nameY = cy + logoSize / 2 + 16
  const nameLocalX = x + w * 0.25
  const nameVisitX = x + w * 0.75
  const nameMaxWidth = w * 0.4
  ctx.font = `800 11px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillStyle = localWon ? '#166534' : '#1e293b'
  ctx.fillText(truncateToWidth(ctx, game.local_team.name, nameMaxWidth), nameLocalX, nameY)
  ctx.fillStyle = visitWon ? '#166534' : '#1e293b'
  ctx.fillText(truncateToWidth(ctx, game.visit_team.name, nameMaxWidth), nameVisitX, nameY)

  const statusY = nameY + 22
  ctx.textAlign = 'center'
  if (isFinished) {
    ctx.font = `800 20px ${FONT}`
    ctx.fillStyle = '#1e293b'
    ctx.fillText(`${game.local_points} - ${game.visit_points}`, centerX, statusY)
  } else {
    ctx.font = `700 11px ${FONT}`
    ctx.fillStyle = '#475569'
    const label = game.status === 'Por aprobar'
      ? 'Por aprobar'
      : `${game.date || ''} · ${(game.hour || '').slice(0, 5)}`.trim()
    ctx.fillText(label, centerX, statusY)
  }
}

function drawMatchRow(ctx, { x, y, w, h, rgb, game, logoMap, zebra }) {
  const rowRadius = Math.min(10, h / 2)
  const isFinished = game.status === 'Terminado'
  const localWon = isFinished && game.local_points > game.visit_points
  const visitWon = isFinished && game.visit_points > game.local_points

  ctx.save()
  roundedRectPath(ctx, x, y, w, h, rowRadius)
  ctx.clip()
  ctx.fillStyle = zebra ? `rgba(${rgb.r},${rgb.g},${rgb.b},0.14)` : 'rgba(255,255,255,0.001)'
  ctx.fillRect(x, y, w, h)
  ctx.restore()

  const cy = y + h / 2
  const circleR = Math.min(13, h / 2 - 4)
  const sideGap = 10

  // Marcador (o "vs") al centro — se mide antes de dibujar nada para saber
  // cuánto espacio le queda de verdad a cada nombre de equipo.
  const scoreText = isFinished ? `${game.local_points} - ${game.visit_points}` : 'vs'
  ctx.font = `800 15px ${FONT}`
  const scoreWidth = ctx.measureText(scoreText).width
  const centerX = x + w / 2
  const scoreLeft = centerX - scoreWidth / 2
  const scoreRight = centerX + scoreWidth / 2

  const localCx = x + 12 + circleR
  drawAvatarCircle(ctx, { img: logoMap[game.local_team.logo_url], name: game.local_team.name, cx: localCx, cy, r: circleR })
  const localNameX = localCx + circleR + 8
  const localMaxWidth = Math.max(20, scoreLeft - sideGap - localNameX)
  ctx.textAlign = 'left'
  ctx.font = `${localWon ? '800' : '700'} 12px ${FONT}`
  ctx.fillStyle = localWon ? '#166534' : '#1e293b'
  ctx.fillText(truncateToWidth(ctx, game.local_team.name, localMaxWidth), localNameX, cy + 4)

  const visitCx = x + w - 12 - circleR
  drawAvatarCircle(ctx, { img: logoMap[game.visit_team.logo_url], name: game.visit_team.name, cx: visitCx, cy, r: circleR })
  const visitNameX = visitCx - circleR - 8
  const visitMaxWidth = Math.max(20, visitNameX - sideGap - scoreRight)
  ctx.textAlign = 'right'
  ctx.font = `${visitWon ? '800' : '700'} 12px ${FONT}`
  ctx.fillStyle = visitWon ? '#166534' : '#1e293b'
  ctx.fillText(truncateToWidth(ctx, game.visit_team.name, visitMaxWidth), visitNameX, cy + 4)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#1e293b'
  ctx.fillText(scoreText, centerX, cy + 5)
}

export async function renderJornadaCanvas({
  league,
  matchday,
  featuredMatchId = null,
  format = 'square',
  backgroundMode = 'color',
  baseColor = '#2563eb',
  backgroundImageUrl = null,
  subtitle = '',
  scale = 3
}) {
  const { width, height } = EXPORT_FORMATS[format]
  const rgb = hexToRgb(baseColor)
  const games = matchday.games || []
  const featuredMatch = featuredMatchId ? games.find(g => String(g.id) === String(featuredMatchId)) : null
  const remainingGames = featuredMatch ? games.filter(g => String(g.id) !== String(featuredMatchId)) : games

  const uniqueLogoUrls = [...new Set(games.flatMap(g => [g.local_team.logo_url, g.visit_team.logo_url]).filter(Boolean))]
  const [{ leagueLogoImg, flagstatsImg }, bgImg, ...logoImgs] = await Promise.all([
    loadBrandImages(league),
    backgroundMode === 'image' ? loadImage(backgroundImageUrl) : Promise.resolve(null),
    ...uniqueLogoUrls.map(loadImage)
  ])
  const logoMap = Object.fromEntries(uniqueLogoUrls.map((url, i) => [url, logoImgs[i]]))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.scale(scale, scale)
  ctx.textBaseline = 'alphabetic'

  ctx.save()
  clipToRoundedCard(ctx, width, height)

  drawCardBackground(ctx, { width, height, backgroundMode, bgImg, rgb })
  drawCardHeader(ctx, {
    width,
    leagueName: league?.name,
    leagueLogoImg,
    flagstatsImg,
    title: matchday.name,
    subtitle
  })

  const panelX = 14
  const panelW = width - 28
  let panelY = 84

  if (featuredMatch) {
    drawFeaturedMatchHero(ctx, { x: panelX, y: panelY, w: panelW, rgb, game: featuredMatch, logoMap })
    panelY += HERO_H + 10
  }

  if (remainingGames.length > 0) {
    const panelH = height - panelY - 12
    drawRowsPanelBackground(ctx, { x: panelX, y: panelY, w: panelW, h: panelH, rgb })

    const pad = 7
    const rowGap = 6
    const rowCount = remainingGames.length
    const availableH = panelH - pad * 2 - rowGap * (rowCount - 1)
    // Sin piso mínimo: cuando el hero del partido destacado deja poco alto
    // disponible, las filas deben encogerse para caber, nunca desbordar la
    // tarjeta — un piso fijo aquí fue justo lo que causó el desborde.
    const rowH = Math.min(56, availableH / rowCount)
    const rowX = panelX + pad
    const rowW = panelW - pad * 2

    let cursorY = panelY + pad

    remainingGames.forEach((game, index) => {
      drawMatchRow(ctx, { x: rowX, y: cursorY, w: rowW, h: rowH, rgb, game, logoMap, zebra: index % 2 === 0 })
      cursorY += rowH + rowGap
    })
  }

  ctx.restore()

  return canvas
}
