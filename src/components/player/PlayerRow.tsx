import { useState } from "react"
import "./PlayerRow.css"

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || "?"
}

function PlayerRow({ player }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="player-row">
      <div className="player-row-main">
        {player.image_url && !imageFailed ? (
          <img
            src={player.image_url}
            alt={player.name}
            className="player-row-photo"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="player-row-avatar">{getInitial(player.name)}</div>
        )}

        <span className="player-row-number">#{player.number}</span>
        <span className="player-row-name">{player.name}</span>
      </div>

      {player.position && (
        <span className="player-row-position">{player.position}</span>
      )}
    </div>
  )
}

export default PlayerRow
