import { Link, useParams } from 'react-router-dom'
import TeamLogo from '../common/TeamLogo'
import './CompletePlayersCard.css'

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || '?'
}

function CompletePlayersCard({ players, statLabels }) {
  const { leagueSlug } = useParams()

  if (!players || players.length === 0) return null

  return (
    <section className="complete-players-card">
      <header className="complete-players-header">
        <h3>Jugadores más completos</h3>
        <span className="complete-players-hint">Combinando el ranking de todas las categorías</span>
      </header>

      <ul className="complete-players-list">
        {players.map((player, index) => (
          <li key={player.id} className={`complete-player-row ${index === 0 ? 'leader' : ''}`}>
            <span className={`complete-rank ${index < 3 ? `rank-${index + 1}` : ''}`}>{index + 1}</span>

            <Link to={`/${leagueSlug}/jugadores/${player.id}`} className="complete-player-link">
              {player.photo ? (
                <img src={player.photo} alt={player.name} className="complete-player-photo" loading="lazy" />
              ) : (
                <div className="complete-player-avatar">{getInitial(player.name)}</div>
              )}
              <span className="complete-player-name">
                {player.number != null && <span className="complete-player-number">#{player.number}</span>}
                {player.name}
              </span>
            </Link>

            {player.teamId ? (
              <Link to={`/${leagueSlug}/equipos/${player.teamId}`} className="complete-player-team">
                <TeamLogo logoUrl={player.teamLogo} name={player.team} alt={player.team} className="complete-player-team-logo" />
                <span>{player.team}</span>
              </Link>
            ) : (
              <span className="complete-player-team muted">{player.team || '—'}</span>
            )}

            <div className="complete-player-ranks">
              {Object.entries(player.ranks).map(([statKey, rank]) => (
                <span key={statKey} className="complete-stat-pill">
                  {statLabels[statKey]} <strong>#{String(rank)}</strong>
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default CompletePlayersCard
