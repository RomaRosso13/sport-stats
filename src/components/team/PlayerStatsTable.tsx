import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './PlayerStatsTable.css'

const INITIAL_LIMIT = 10

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || "?"
}

function PlayerAvatar({ photo, name }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (photo && !imageFailed) {
    return (
      <img
        src={photo}
        alt={name}
        className="player-photo"
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    )
  }

  return <div className="player-avatar">{getInitial(name)}</div>
}

function PlayerStatsTable({ title, statKey, statLabel, data }) {
  const { leagueSlug } = useParams()
  const [expanded, setExpanded] = useState(false)
  const hasData = data && data.length > 0
  const hasMore = hasData && data.length > INITIAL_LIMIT
  const visibleData = expanded ? data : (data || []).slice(0, INITIAL_LIMIT)

  return (
    <section className="player-stats-table">
      <header className="player-stats-header">
        <h3>{title}</h3>
        {hasData && (
          <span className="player-stats-count">
            {data.length} jugador{data.length === 1 ? '' : 'es'}
          </span>
        )}
      </header>

      {!hasData ? (
        <p className="player-stats-empty">Aún no hay estadísticas registradas</p>
      ) : (
        <>
          <ul className="player-stats-list">
            {visibleData.map((player, index) => (
              <li
                key={player.id}
                className={`player-stats-row ${index === 0 ? 'leader' : ''}`}
              >
                <span className={`stats-rank ${index < 3 ? `rank-${index + 1}` : ''}`}>
                  {index + 1}
                </span>

                <Link to={`/${leagueSlug}/jugadores/${player.id}`} className="jugador-link">
                  <PlayerAvatar photo={player.photo} name={player.name} />
                  <span className="player-name">
                    {player.number != null && <span className="player-number">#{player.number}</span>}
                    {player.name}
                  </span>
                </Link>

                {player.teamId ? (
                  <Link to={`/${leagueSlug}/equipos/${player.teamId}`} className="stats-team-link">
                    {player.teamLogo && (
                      <img src={player.teamLogo} alt={player.team} className="stats-team-logo" loading="lazy" />
                    )}
                    <span className="stats-team-name">{player.team}</span>
                  </Link>
                ) : (
                  <span className="stats-team-link muted">
                    <span className="stats-team-name">{player.team || '—'}</span>
                  </span>
                )}

                <span className="stat-value">
                  {player[statKey]}
                  <span className="stat-value-label">{statLabel}</span>
                </span>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              type="button"
              className="stats-toggle-btn"
              onClick={() => setExpanded(prev => !prev)}
            >
              {expanded ? 'Ver menos' : `Ver los ${data.length} jugadores`}
            </button>
          )}
        </>
      )}
    </section>
  )
}

export default PlayerStatsTable
