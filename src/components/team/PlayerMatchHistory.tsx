import TeamLogo from '../common/TeamLogo'
import './PlayerMatchHistory.css'

function PlayerMatchHistory({ games = [], statKeys = [], statLabels = {} }) {
  if (games.length === 0) {
    return <p className="player-history-empty">Aún no hay partidos jugados</p>
  }

  return (
    <div className="player-history-list">
      {[...games].reverse().map(game => {
        const breakdown = statKeys.filter(key => game[key] > 0)

        return (
          <div key={game.id} className="player-history-row">
            <div className="player-history-date">{game.date || '—'}</div>

            <div className="player-history-opponent">
              {game.opponent ? (
                <>
                  <span className="player-history-vs">vs</span>
                  <TeamLogo logoUrl={game.opponentLogo} name={game.opponent} alt={game.opponent} className="player-history-opponent-logo" />
                  <span className="player-history-opponent-name">{game.opponent}</span>
                </>
              ) : (
                <span className="player-history-opponent-name muted">Rival no disponible</span>
              )}
            </div>

            <div className="player-history-stats">
              {breakdown.length > 0 ? (
                breakdown.map(key => (
                  <span key={key} className="player-history-pill">
                    {game[key]} {statLabels[key]}
                  </span>
                ))
              ) : (
                <span className="player-history-pill muted">Sin estadísticas</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PlayerMatchHistory
