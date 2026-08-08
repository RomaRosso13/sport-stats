import { getInitials } from '../../utils/initials'
import { calculateTeamGameLog } from '../../utils/calculateTeamGameLog'
import { hexToRgb } from '../../utils/colorMath'
import { EXPORT_FORMATS } from '../../utils/exportCardConfig'
import { formatRowStat } from '../../utils/standingsExport'

import './StandingsExportCard.css'

function medalClass(rank, showMedals) {
  if (!showMedals) return rank % 2 === 0 ? 'zebra-b' : 'zebra-a'
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return rank % 2 === 0 ? 'zebra-b' : 'zebra-a'
}

function FormDots({ team, matchdays }) {
  const games = calculateTeamGameLog(team, matchdays).slice(-5)

  if (games.length === 0) return <span className="export-stat">—</span>

  return (
    <span className="export-form">
      {games.map(g => (
        <span key={g.id} className={`export-form-dot result-${g.result}`} />
      ))}
    </span>
  )
}

function StandingsExportCard({
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
  matchdays = []
}) {
  const { width, height } = EXPORT_FORMATS[format]
  const rgb = hexToRgb(baseColor)
  const zebraTint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`
  // Sin gradientes en capas ni imágenes (logos, íconos) — solo color plano y
  // texto. Es lo más simple que html2canvas puede rasterizar: nada que
  // descargar ni decodificar al momento de exportar, así no hay forma de
  // que una imagen lenta o un navegador quisquilloso trabe la generación.
  const rowsBackground = `rgba(255,255,255,.85)`

  const backgroundStyle = backgroundMode === 'image' && backgroundImageUrl
    ? {
      backgroundImage: `linear-gradient(0deg, rgba(10,14,22,.62), rgba(10,14,22,.24)), url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
    : { backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }

  return (
    <div className={`export-card export-card-${format}`} style={{ width, height, ...backgroundStyle }}>
      <div className="export-card-head">
        <div className="export-card-head-top">
          <div className="export-card-head-left">
            <span className="export-league-badge">{league?.name?.charAt(0)}</span>
            <div>
              <div className="export-league-name">{league?.name}</div>
              <div className="export-title">Tabla de Posiciones</div>
              {subtitle && <div className="export-subtitle">{subtitle}</div>}
            </div>
          </div>
          <span className="export-flagstats-badge">FlagStats</span>
        </div>
      </div>

      <div className="export-rows" style={{ background: rowsBackground }}>
        {tableStyle === 'full' && (
          <div className="export-row-header">
            <span className="export-pos" />
            <span className="export-team-logo" />
            <span className="export-team-name" />
            <span className="export-col">PJ</span>
            <span className="export-col">PG</span>
            <span className="export-col">PE</span>
            <span className="export-col">PP</span>
            <span className="export-col export-col-pts">Pts</span>
          </div>
        )}
        {rows.map((row, index) => {
          const rank = index + 1
          const cls = medalClass(rank, showMedals)
          const rowStyle = cls.startsWith('zebra') ? { background: cls === 'zebra-a' ? zebraTint : 'transparent' } : undefined

          return (
            <div className={`export-row ${tableStyle === 'full' ? 'export-row-full' : ''} ${cls}`} key={row.id ?? row.equipo} style={rowStyle}>
              <span className="export-pos">{rank}</span>
              <span className="export-team-logo">{getInitials(row.equipo)}</span>
              <span className="export-team-name">{row.equipo}</span>
              {tableStyle === 'full' ? (
                <>
                  <span className="export-col">{row.pj}</span>
                  <span className="export-col">{row.g}</span>
                  <span className="export-col">{row.e}</span>
                  <span className="export-col">{row.p}</span>
                  <span className="export-col export-col-pts">{row.puntos}</span>
                </>
              ) : statKey === 'form' ? (
                <FormDots team={row.equipo} matchdays={matchdays} />
              ) : (
                <span className="export-stat">{formatRowStat(row, statKey)}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StandingsExportCard
