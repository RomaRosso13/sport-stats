import "./PlayerRow.css"

function PlayerRow({ jugador }) {
  return (
    <div className="player-row">
      <span className="player-name">{jugador.nombre}</span>
      <span className="player-position">{jugador.posicion}</span>
    </div>
  )
}

export default PlayerRow
