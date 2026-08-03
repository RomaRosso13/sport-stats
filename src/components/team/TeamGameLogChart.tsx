import { useState } from 'react'
import './TeamGameLogChart.css'

function TeamGameLogChart({ games = [] }) {
  const [activeId, setActiveId] = useState(null)

  if (games.length === 0) {
    return <p className="team-chart-empty">Aún no hay partidos jugados para mostrar tendencia</p>
  }

  const maxPoints = Math.max(1, ...games.flatMap(g => [g.pointsFor, g.pointsAgainst]))

  return (
    <div className="team-gamelog-chart">
      <div className="team-chart-legend">
        <span className="legend-item"><span className="legend-dot favor" /> A favor</span>
        <span className="legend-item"><span className="legend-dot contra" /> En contra</span>
      </div>

      <div className="team-gamelog-track">
        <div className="team-gamelog-bars">
          {games.map((game, index) => {
            const forPct = (game.pointsFor / maxPoints) * 100
            const againstPct = (game.pointsAgainst / maxPoints) * 100
            const isActive = activeId === game.id

            return (
              <div
                key={game.id}
                className={`team-gamelog-group ${isActive ? 'active' : ''}`}
                tabIndex={0}
                onMouseEnter={() => setActiveId(game.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(game.id)}
                onBlur={() => setActiveId(null)}
              >
                {isActive && (
                  <div className="team-gamelog-tooltip">
                    <strong>{game.pointsFor}-{game.pointsAgainst}</strong>
                    <span>vs {game.opponent}</span>
                  </div>
                )}

                <div className="team-gamelog-bar-pair">
                  <div className="team-gamelog-bar-col">
                    <span className="team-gamelog-value">{game.pointsFor}</span>
                    <div className="team-gamelog-bar-track">
                      <div className="team-gamelog-bar favor" style={{ height: `${forPct}%` }} />
                    </div>
                  </div>
                  <div className="team-gamelog-bar-col">
                    <span className="team-gamelog-value">{game.pointsAgainst}</span>
                    <div className="team-gamelog-bar-track">
                      <div className="team-gamelog-bar contra" style={{ height: `${againstPct}%` }} />
                    </div>
                  </div>
                </div>

                <span className="team-gamelog-tick">J{index + 1}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TeamGameLogChart
