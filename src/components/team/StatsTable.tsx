import { useState } from "react"
import "./StatsTable.css"

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
        onError={() => setImageFailed(true)}
      />
    )
  }

  return <div className="leader-avatar">{getInitial(name)}</div>
}

function StatsTable({ title, statKey, data }) {
  const hasData = data && data.length > 0
  const leader = hasData ? data[0] : null
  const rest = hasData ? data.slice(1, 3) : []

  return (
    <div className="stats-card espn">
      <div className="stats-header">
        <span className="stats-title">{title}</span>
      </div>

      {!hasData ? (
        <div className="stats-empty">Aún no hay estadísticas</div>
      ) : (
        <>
          {/* Líder */}
          <div className="stats-leader">
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
            </div>

            <span className="leader-value">{leader[statKey]}</span>
          </div>

          {/* Resto */}
          {rest.length > 0 && (
            <div className="stats-rest">
              {rest.map((p, index) => (
                <div key={p.id} className="stats-row">
                  <span className="rest-rank">{index + 2}</span>
                  <span className="rest-name">
                    {p.number != null && <span className="player-number">#{p.number}</span>}
                    {p.name}
                  </span>
                  <span className="rest-value">{p[statKey]}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StatsTable
