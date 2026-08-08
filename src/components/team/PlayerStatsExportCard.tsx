import { getInitials } from '../../utils/initials'
import { hexToRgb } from '../../utils/colorMath'
import { EXPORT_FORMATS } from '../../utils/exportCardConfig'

import './PlayerStatsExportCard.css'

function medalClass(rank, showMedals) {
  if (!showMedals) return rank % 2 === 0 ? 'zebra-b' : 'zebra-a'
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return rank % 2 === 0 ? 'zebra-b' : 'zebra-a'
}

function PlayerStatsExportCard({
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
  showMedals = true
}) {
  const { width, height } = EXPORT_FORMATS[format]
  const title = mode === 'complete' ? 'Jugadores más completos' : statLabel
  const rgb = hexToRgb(baseColor)
  const zebraTint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`

  const backgroundStyle = backgroundMode === 'image' && backgroundImageUrl
    ? {
      backgroundImage: `linear-gradient(0deg, rgba(10,14,22,.62), rgba(10,14,22,.24)), url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
    : {
      backgroundImage: `linear-gradient(120deg, rgba(${rgb.r},${rgb.g},${rgb.b},.55) 0%, transparent 45%), linear-gradient(160deg, #0f172a, #111827 60%)`
    }

  return (
    <div className={`export-card export-card-${format}`} style={{ width, height, ...backgroundStyle }}>
      <div className="export-card-head">
        <div className="export-card-head-top">
          <div className="export-card-head-left">
            {league?.image_url ? (
              <img src={league.image_url} alt={league.name} className="export-league-badge" />
            ) : (
              <span className="export-league-badge export-league-badge-fallback">{league?.name?.charAt(0)}</span>
            )}
            <div>
              <div className="export-league-name">{league?.name}</div>
              <div className="export-title">{title}</div>
              {subtitle && <div className="export-subtitle">{subtitle}</div>}
            </div>
          </div>
          <span className="export-flagstats-badge">FlagStats</span>
        </div>
      </div>

      <div className="export-rows">
        {rows.map((row, index) => {
          const rank = index + 1
          const cls = medalClass(rank, showMedals)
          const rowStyle = cls.startsWith('zebra') ? { background: cls === 'zebra-a' ? zebraTint : 'transparent' } : undefined

          return (
            <div className={`export-row ${cls}`} key={row.id} style={rowStyle}>
              <span className="export-rank-tab" style={{ background: `rgb(${rgb.r},${rgb.g},${rgb.b})` }}>{rank}</span>
              {row.photo ? (
                <img src={row.photo} alt={row.name} className="export-player-photo" />
              ) : (
                <span className="export-player-photo export-player-photo-fallback">{getInitials(row.name, 1)}</span>
              )}
              <div className="export-player-info">
                <span className="export-player-name">{row.name}</span>
                <span className="export-player-team">{row.team}</span>
              </div>
              <span className="export-stat">
                {mode === 'complete' ? (row.averageRank != null ? row.averageRank.toFixed(1) : '—') : (row[statKey] ?? 0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlayerStatsExportCard
