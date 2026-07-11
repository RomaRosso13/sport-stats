import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './PlayerStatsTable.css'

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
        onError={() => setImageFailed(true)}
      />
    )
  }

  return <div className="player-avatar">{getInitial(name)}</div>
}

function PlayerStatsTable({ title, statKey, statLabel, data }) {
  const { leagueSlug } = useParams()
  const hasData = data && data.length > 0

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
        <div className="player-stats-wrapper">
          <table className="tabla-jugadores">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Jugador</th>
                <th>Equipo</th>
                <th>{statLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((player, index) => (
                <tr key={player.id} className={index === 0 ? 'leader' : ''}>
                  <td>{index + 1}</td>
                  <td className="jugador-cell">
                    <Link to={`/${leagueSlug}/jugadores/${player.id}`} className="jugador-link">
                      <PlayerAvatar photo={player.photo} name={player.name} />
                      <span className="player-name">
                        {player.number != null && <span className="player-number">#{player.number}</span>}
                        {player.name}
                      </span>
                    </Link>
                  </td>
                  <td>{player.team}</td>
                  <td className="stat-value">{player[statKey]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default PlayerStatsTable
