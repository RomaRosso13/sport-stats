import "./PlayerRow.css"

function PlayerRow({ player }) {
  return (
    <div className="player-row">
      <span className="player-name">{player.nombre}</span>
      <span className="player-position">{player.posicion}</span>
    </div>
  )
}

export default PlayerRow
