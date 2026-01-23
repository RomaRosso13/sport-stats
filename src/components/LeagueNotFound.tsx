import './LeagueNotFound.css'

function LeagueNotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <span className="emoji">🏈</span>

        <h1>Liga no disponible</h1>
        <p>
          Esta liga no existe, fue eliminada<br />
          o aún no está disponible.
        </p>
      </div>
    </div>
  )
}

export default LeagueNotFound
