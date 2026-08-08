import { getInitials } from '../../utils/initials'
import { hexToRgb } from '../../utils/colorMath'
import { EXPORT_FORMATS } from '../../utils/exportCardConfig'

import './JornadaExportCard.css'

function JornadaExportCard({
  league,
  matchday,
  featuredMatchId = null,
  format = 'square',
  backgroundMode = 'color',
  baseColor = '#2563eb',
  backgroundImageUrl = null,
  subtitle = ''
}) {
  const { width, height } = EXPORT_FORMATS[format]
  const rgb = hexToRgb(baseColor)
  const accentColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const zebraTint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`
  const games = matchday?.games || []
  const featuredMatch = featuredMatchId ? games.find(g => String(g.id) === String(featuredMatchId)) : null
  const remainingGames = featuredMatch ? games.filter(g => String(g.id) !== String(featuredMatchId)) : games

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
              <div className="export-title">{matchday?.name}</div>
              {subtitle && <div className="export-subtitle">{subtitle}</div>}
            </div>
          </div>
          <span className="export-flagstats-badge">FlagStats</span>
        </div>
      </div>

      {featuredMatch && (() => {
        const isFinished = featuredMatch.status === 'Terminado'
        const localWon = isFinished && featuredMatch.local_points > featuredMatch.visit_points
        const visitWon = isFinished && featuredMatch.visit_points > featuredMatch.local_points
        const statusLabel = isFinished
          ? `${featuredMatch.local_points} - ${featuredMatch.visit_points}`
          : featuredMatch.status === 'Por aprobar'
            ? 'Por aprobar'
            : `${featuredMatch.date || ''} · ${(featuredMatch.hour || '').slice(0, 5)}`.trim()

        return (
          <div className="export-hero">
            <span className="export-hero-label" style={{ color: accentColor }}>⚡ Partido destacado</span>
            <div className="export-hero-matchup">
              <div className="export-hero-side">
                <div className="export-hero-photo-wrap local">
                  {featuredMatch.local_team.logo_url ? (
                    <img src={featuredMatch.local_team.logo_url} alt={featuredMatch.local_team.name} className="export-hero-photo" />
                  ) : (
                    <span className="export-hero-photo export-hero-photo-fallback" style={{ background: accentColor }}>{getInitials(featuredMatch.local_team.name, 1)}</span>
                  )}
                </div>
                <span className={`export-hero-name ${localWon ? 'won' : ''}`}>{featuredMatch.local_team.name}</span>
              </div>

              <span className="export-hero-vs" style={{ background: accentColor }}>VS</span>

              <div className="export-hero-side">
                <div className="export-hero-photo-wrap visit">
                  {featuredMatch.visit_team.logo_url ? (
                    <img src={featuredMatch.visit_team.logo_url} alt={featuredMatch.visit_team.name} className="export-hero-photo" />
                  ) : (
                    <span className="export-hero-photo export-hero-photo-fallback" style={{ background: accentColor }}>{getInitials(featuredMatch.visit_team.name, 1)}</span>
                  )}
                </div>
                <span className={`export-hero-name ${visitWon ? 'won' : ''}`}>{featuredMatch.visit_team.name}</span>
              </div>
            </div>
            <div className="export-hero-status">{statusLabel}</div>
          </div>
        )
      })()}

      <div className="export-rows">
        {remainingGames.map((game, index) => {
          const isFinished = game.status === 'Terminado'
          const localWon = isFinished && game.local_points > game.visit_points
          const visitWon = isFinished && game.visit_points > game.local_points
          const rowStyle = index % 2 === 0 ? { background: zebraTint } : undefined

          return (
            <div className="export-jornada-row" key={game.id} style={rowStyle}>
              <div className={`export-jornada-team local ${localWon ? 'won' : ''}`}>
                {game.local_team.logo_url ? (
                  <img src={game.local_team.logo_url} alt={game.local_team.name} className="export-jornada-logo" />
                ) : (
                  <span className="export-jornada-logo export-jornada-logo-fallback">{getInitials(game.local_team.name, 1)}</span>
                )}
                <span className="export-jornada-name">{game.local_team.name}</span>
              </div>

              <span className="export-jornada-score">
                {isFinished ? `${game.local_points} - ${game.visit_points}` : 'vs'}
              </span>

              <div className={`export-jornada-team visit ${visitWon ? 'won' : ''}`}>
                <span className="export-jornada-name">{game.visit_team.name}</span>
                {game.visit_team.logo_url ? (
                  <img src={game.visit_team.logo_url} alt={game.visit_team.name} className="export-jornada-logo" />
                ) : (
                  <span className="export-jornada-logo export-jornada-logo-fallback">{getInitials(game.visit_team.name, 1)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default JornadaExportCard
