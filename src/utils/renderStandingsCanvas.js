import { hexToRgb } from './colorMath'
import { calculateTeamGameLog } from './calculateTeamGameLog'
import { EXPORT_FORMATS } from './exportCardConfig'
import { formatRowStat } from './standingsExport'
import {
  FONT, medalStyle, truncateToWidth, loadImage, loadBrandImages,
  roundedRectPath, clipToRoundedCard, drawAvatarCircle,
  drawCrown, drawMedal, RANK_TAB_W, drawRankBadge,
  drawCardBackground, drawCardHeader, drawRowsPanelBackground
} from './exportCardHelpers'

const FULL_COLS = [
  { key: 'pj', label: 'PJ', width: 20 },
  { key: 'g', label: 'PG', width: 20 },
  { key: 'e', label: 'PE', width: 20 },
  { key: 'p', label: 'PP', width: 20 },
  { key: 'puntos', label: 'Pts', width: 26 }
]
const FULL_COLS_GAP = 4

export async function renderStandingsCanvas({
  league,
  rows,
  format = 'square',
  backgroundMode = 'color',
  baseColor = '#2563eb',
  backgroundImageUrl = null,
  statKey = 'record',
  tableStyle = 'compact',
  subtitle = '',
  showMedals = true,
  matchdays = [],
  scale = 3
}) {
  const { width, height } = EXPORT_FORMATS[format]
  const rgb = hexToRgb(baseColor)

  const uniqueTeamUrls = [...new Set(rows.map(row => row.logo).filter(Boolean))]
  const [{ leagueLogoImg, flagstatsImg }, bgImg, ...teamImgs] = await Promise.all([
    loadBrandImages(league),
    backgroundMode === 'image' ? loadImage(backgroundImageUrl) : Promise.resolve(null),
    ...uniqueTeamUrls.map(loadImage)
  ])
  const teamLogoMap = Object.fromEntries(uniqueTeamUrls.map((url, i) => [url, teamImgs[i]]))

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
    title: 'Tabla de Posiciones',
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
  const headerH = tableStyle === 'full' ? 14 : 0
  const rowCount = Math.max(rows.length, 1)
  const availableH = panelH - pad * 2 - (headerH > 0 ? headerH + rowGap : 0) - rowGap * (rowCount - 1)
  const rowH = Math.max(18, availableH / rowCount)
  const rowX = panelX + pad
  const rowW = panelW - pad * 2

  let cursorY = panelY + pad

  if (tableStyle === 'full') {
    const totalColsWidth = FULL_COLS.reduce((sum, c) => sum + c.width, 0) + FULL_COLS_GAP * (FULL_COLS.length - 1)
    let colX = rowX + rowW - totalColsWidth
    ctx.font = `800 8.5px ${FONT}`
    ctx.fillStyle = '#64748b'
    ctx.textAlign = 'center'
    FULL_COLS.forEach(col => {
      ctx.fillText(col.label, colX + col.width / 2, cursorY + headerH - 3)
      colX += col.width + FULL_COLS_GAP
    })
    cursorY += headerH + rowGap
  }

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

    // Pestaña diagonal con el número — le da un corte angular a la fila en
    // vez del bloque parejo, y funciona como acento de marca.
    drawRankBadge(ctx, rowX, y, RANK_TAB_W, rowH, rgb, rank)

    ctx.restore()

    const textColor = medal ? medal.text : '#1e293b'
    const midY = y + rowH / 2 + 4

    const circleR = 10
    const circleX = rowX + RANK_TAB_W + 8 + circleR
    const circleY = y + rowH / 2
    const teamImg = row.logo ? teamLogoMap[row.logo] : null
    drawAvatarCircle(ctx, { img: teamImg, name: row.equipo, cx: circleX, cy: circleY, r: circleR })

    let nameX = circleX + circleR + 8

    if (rank === 1 && showMedals) {
      drawCrown(ctx, nameX + 7, y + rowH / 2, 15)
      nameX += 16
    } else if ((rank === 2 || rank === 3) && showMedals) {
      drawMedal(ctx, nameX + 6, y + rowH / 2, 13, rank === 2 ? '#64748b' : '#9a3412')
      nameX += 14
    }

    let statLabel = ''
    let statColsStart = rowX + rowW - 8

    if (tableStyle === 'full') {
      const totalColsWidth = FULL_COLS.reduce((sum, c) => sum + c.width, 0) + FULL_COLS_GAP * (FULL_COLS.length - 1)
      let colX = rowX + rowW - totalColsWidth
      ctx.textAlign = 'center'
      FULL_COLS.forEach(col => {
        const value = col.key === 'puntos' ? row.puntos : row[col.key]
        ctx.font = col.key === 'puntos' ? `800 10.5px ${FONT}` : `700 10.5px ${FONT}`
        ctx.fillStyle = textColor
        ctx.globalAlpha = col.key === 'puntos' ? 1 : 0.75
        ctx.fillText(String(value), colX + col.width / 2, midY)
        colX += col.width + FULL_COLS_GAP
      })
      ctx.globalAlpha = 1
      statColsStart = rowX + rowW - totalColsWidth - 8
    } else if (statKey === 'form') {
      const games = calculateTeamGameLog(row.equipo, matchdays).slice(-5)
      const dotR = 3.5
      const dotGap = 5
      let dotX = rowX + rowW - 8 - dotR
      for (let i = games.length - 1; i >= 0; i--) {
        const g = games[i]
        ctx.fillStyle = g.result === 'G' ? '#16a34a' : g.result === 'P' ? '#dc2626' : '#f59e0b'
        ctx.beginPath()
        ctx.arc(dotX, y + rowH / 2, dotR, 0, Math.PI * 2)
        ctx.fill()
        dotX -= dotR * 2 + dotGap
      }
      statColsStart = games.length > 0 ? dotX + dotR * 2 + dotGap - 6 : rowX + rowW - 8
      if (games.length === 0) {
        ctx.fillStyle = textColor
        ctx.font = `700 11px ${FONT}`
        ctx.textAlign = 'right'
        ctx.fillText('—', rowX + rowW - 8, midY)
      }
    } else {
      statLabel = formatRowStat(row, statKey)
      ctx.font = `800 11px ${FONT}`
      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.7
      ctx.textAlign = 'right'
      ctx.fillText(statLabel, rowX + rowW - 8, midY)
      ctx.globalAlpha = 1
      statColsStart = rowX + rowW - 8 - ctx.measureText(statLabel).width - 8
    }

    ctx.font = `700 12px ${FONT}`
    ctx.fillStyle = textColor
    ctx.globalAlpha = 1
    ctx.textAlign = 'left'
    const maxNameWidth = Math.max(20, statColsStart - nameX)
    ctx.fillText(truncateToWidth(ctx, row.equipo, maxNameWidth), nameX, midY)

    cursorY += rowH + rowGap
  })

  ctx.restore()

  return canvas
}
