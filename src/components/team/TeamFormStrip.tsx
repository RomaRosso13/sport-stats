import './TeamFormStrip.css'

const RESULT_LABEL = { G: 'Ganado', P: 'Perdido', E: 'Empatado' }

function TeamFormStrip({ games = [] }) {
  if (games.length === 0) {
    return <p className="team-form-empty">Aún sin partidos jugados</p>
  }

  return (
    <div className="team-form-strip">
      <span className="team-form-label">Forma reciente</span>
      <div className="team-form-chips">
        {games.map(game => (
          <span
            key={game.id}
            className={`team-form-chip result-${game.result}`}
            title={`${RESULT_LABEL[game.result]} vs ${game.opponent} (${game.pointsFor}-${game.pointsAgainst})`}
          >
            {game.result}
          </span>
        ))}
      </div>
    </div>
  )
}

export default TeamFormStrip
