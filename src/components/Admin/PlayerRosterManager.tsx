import { useState } from 'react'
import { sortPlayersByNumber } from '../../utils/sortPlayers'
import './PlayerRosterManager.css'

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || "?"
}

function RosterAvatar({ imageUrl, name }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="roster-photo"
        onError={() => setImageFailed(true)}
      />
    )
  }

  return <div className="roster-avatar">{getInitial(name)}</div>
}

function PlayerRosterManager({ team, onAddPlayer, onEditPlayer, onToggleActive }) {
  const players = sortPlayersByNumber(team.Player || [])

  return (
    <section className="roster-manager">
      <div className="section-header">
        <h3>Jugadores – {team.name}</h3>
        <button className="primary-btn" onClick={onAddPlayer}>
          + Nuevo jugador
        </button>
      </div>

      {players.length === 0 ? (
        <p className="empty-state">Este equipo aún no tiene jugadores</p>
      ) : (
        <div className="roster-list">
          {players.map(player => (
            <div key={player.id} className={`roster-row ${player.active ? '' : 'inactive'}`}>
              <div className="roster-main">
                <RosterAvatar imageUrl={player.image_url} name={player.name} />

                <span className="roster-number">
                  {player.number != null ? `#${player.number}` : '—'}
                </span>
                <span className="roster-name">{player.name}</span>
                {player.position && <span className="roster-position">{player.position}</span>}
                {!player.active && <span className="roster-inactive-tag">Inactivo</span>}
              </div>

              <div className="roster-actions">
                <button type="button" onClick={() => onEditPlayer(player)}>
                  Editar
                </button>
                <button
                  type="button"
                  className={player.active ? 'deactivate-btn' : 'activate-btn'}
                  onClick={() => onToggleActive(player)}
                >
                  {player.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default PlayerRosterManager
