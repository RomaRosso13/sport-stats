import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import "./StatsTable.css"
import "./LeagueChampionsCard.css"

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || "?"
}

function LeaderAvatar({ photo, name }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (photo && !imageFailed) {
    return (
      <img
        src={photo}
        alt={name}
        className="leader-photo"
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    )
  }

  return <div className="leader-avatar">{getInitial(name)}</div>
}

// Igual que StatsTable, pero además muestra a qué categoría/división
// pertenece cada jugador — necesario aquí porque el ranking junta a TODOS
// los jugadores de la liga, sin importar su categoría.
function LeagueChampionsCard({ title, statKey, data }) {
  const { leagueSlug } = useParams()
  const hasData = data && data.length > 0
  const leader = hasData ? data[0] : null
  const rest = hasData ? data.slice(1, 3) : []

  return (
    <div className="stats-card espn league-champions-card">
      <div className="stats-header">
        <span className="stats-title">{title}</span>
      </div>

      {!hasData ? (
        <div className="stats-empty">Aún no hay estadísticas</div>
      ) : (
        <>
          <Link to={`/${leagueSlug}/jugadores/${leader.id}`} className="stats-leader">
            <div className="leader-photo-wrap">
              <LeaderAvatar key={leader.photo} photo={leader.photo} name={leader.name} />
              <span className="leader-rank">1</span>
            </div>

            <div className="leader-info">
              <span className="leader-name">
                {leader.number != null && <span className="player-number">#{leader.number}</span>}
                {leader.name}
              </span>
              <span className="leader-team">{leader.team}</span>
              {leader.categoryLabel && (
                <span className="leader-category-tag">{leader.categoryLabel}</span>
              )}
            </div>

            <span className="leader-value">{leader[statKey]}</span>
          </Link>

          {rest.length > 0 && (
            <div className="stats-rest">
              {rest.map((p, index) => (
                <Link to={`/${leagueSlug}/jugadores/${p.id}`} key={p.id} className="stats-row champions-row">
                  <span className="rest-rank">{index + 2}</span>
                  <span className="rest-name">
                    <span className="rest-name-text">
                      {p.number != null && <span className="player-number">#{p.number}</span>}
                      {p.name}
                    </span>
                    {p.categoryLabel && <span className="rest-category-tag">{p.categoryLabel}</span>}
                  </span>
                  <span className="rest-value">{p[statKey]}</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LeagueChampionsCard
