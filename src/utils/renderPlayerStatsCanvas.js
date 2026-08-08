import { hexToRgb } from './colorMath'
import { EXPORT_FORMATS } from './exportCardConfig'
import {
  FONT, medalStyle, truncateToWidth, loadImage, loadBrandImages,
  roundedRectPath, clipToRoundedCard, drawAvatarCircle,
  drawCrown, drawMedal, RANK_TAB_W, drawRankBadge,
  drawCardBackground, drawCardHeader, drawRowsPanelBackground
} from './exportCardHelpers'

export async function renderPlayerStatsCanvas({
  league,
  rows,
  mode = 'stat',
  statKey,
  statLabel,
  format = 'square',
  backgroundMode = 'color',
  baseColor = '#2563eb',
  backgroundImageUrl = null,
  subtitle = '',
  showMedals = true,
  scale = 3
}) {
  const title = mode === 'complete' ? 'Jugadores más completos' : statLabel
  const { width, height } = EXPORT_FORMATS[format]
  const rgb = hexToRgb(baseColor)

  const uniquePhotoUrls = [...new Set(rows.map(row => row.photo).filter(Boolean))]
  const [{ leagueLogoImg, flagstatsImg }, bgImg, ...photoImgs] = await Promise.all([
    loadBrandImages(league),
    backgroundMode === 'image' ? loadImage(backgroundImageUrl) : Promise.resolve(null),
    ...uniquePhotoUrls.map(loadImage)
  ])
  const photoMap = Object.fromEntries(uniquePhotoUrls.map((url, i) => [url, photoImgs[i]]))

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
    title,
    subtitle
  })

  // --- Panel de filas ---
  const panelX = 14
  const panelY = 84
  const panelW = width - 28
  const panelH = height - panelY - 12
  drawRowsPanelBackground(ctx, { x: panelX, y: panelY, w: panelW, h: panelH, rgb })

  const pad = 7
  const rowGap = 4
  const rowCount = Math.max(rows.length, 1)
  const availableH = panelH - pad * 2 - rowGap * (rowCount - 1)
  // Dos líneas de texto (nombre + equipo) piden más alto que las filas de
  // la tabla de posiciones, que solo tenían una línea.
  const rowH = Math.max(26, availableH / rowCount)
  const rowX = panelX + pad
  const rowW = panelW - pad * 2

  let cursorY = panelY + pad

  rows.forEach((row, index) => {
    const rank = index + 1
    const medal = medalStyle(rank, showMedals)
    const y = cursorY
    const rowRadius = Math.min(10, rowH / 2)

    ctx.save()
    roundedRectPath(ctx, rowX, y, rowW, rowH, rowRadius)
    ctx.clip()

    if (medal) {
      const grad = ctx.createLinearGradient(rowX, y, rowX + rowW, y + rowH)
      grad.addColorStop(0, medal.from)
      grad.addColorStop(1, medal.to)
      ctx.fillStyle = grad
      ctx.fillRect(rowX, y, rowW, rowH)
    } else if (index % 2 === 0) {
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.14)`
      ctx.fillRect(rowX, y, rowW, rowH)
    }

    drawRankBadge(ctx, rowX, y, RANK_TAB_W, rowH, rgb, rank)
    ctx.restore()

    const textColor = medal ? medal.text : '#1e293b'

    const circleR = 12
    const circleX = rowX + RANK_TAB_W + 8 + circleR
    const circleY = y + rowH / 2
    const photoImg = row.photo ? photoMap[row.photo] : null
    drawAvatarCircle(ctx, { img: photoImg, name: row.name, cx: circleX, cy: circleY, r: circleR })

    let nameX = circleX + circleR + 8

    if (rank === 1 && showMedals) {
      drawCrown(ctx, nameX + 7, y + rowH / 2, 15)
      nameX += 16
    } else if ((rank === 2 || rank === 3) && showMedals) {
      drawMedal(ctx, nameX + 6, y + rowH / 2, 13, rank === 2 ? '#64748b' : '#9a3412')
      nameX += 14
    }

    const statText = mode === 'complete'
      ? (row.averageRank != null ? row.averageRank.toFixed(1) : '—')
      : String(row[statKey] ?? 0)
    ctx.font = `800 16px ${FONT}`
    ctx.fillStyle = textColor
    ctx.textAlign = 'right'
    ctx.fillText(statText, rowX + rowW - 10, y + rowH / 2 + 5)
    const statWidth = ctx.measureText(statText).width

    const maxNameWidth = Math.max(20, rowX + rowW - 18 - statWidth - nameX)

    ctx.textAlign = 'left'
    ctx.font = `700 12.5px ${FONT}`
    ctx.fillStyle = textColor
    ctx.globalAlpha = 1
    ctx.fillText(truncateToWidth(ctx, row.name, maxNameWidth), nameX, y + rowH / 2 - 2)

    ctx.font = `600 10px ${FONT}`
    ctx.globalAlpha = 0.65
    ctx.fillText(truncateToWidth(ctx, row.team || '', maxNameWidth), nameX, y + rowH / 2 + 11)
    ctx.globalAlpha = 1

    cursorY += rowH + rowGap
  })

  ctx.restore()

  return canvas
}
