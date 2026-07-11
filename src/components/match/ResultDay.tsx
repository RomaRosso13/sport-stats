import ResultCard from "./ResultCard"
import "./ResultDay.css"

function ResultsDay({ matchday, teams }) {
  const byeTeams = getByeTeams(teams, matchday.games)

  function getByeTeams(teams, games) {
    if (!teams || teams.length === 0) return []

    const teamsThatPlayed = new Set()

    games.forEach(game => {
      teamsThatPlayed.add(game.local_team.id)
      teamsThatPlayed.add(game.visit_team.id)
    })

    return teams.filter(team => !teamsThatPlayed.has(team.id))
  }


  const totalGames = matchday.games.length
  const finishedGames = matchday.games.filter(g => g.status === "Terminado").length
  const reviewGames = matchday.games.filter(g => g.status === "Por aprobar").length
  const pendingGames = totalGames - finishedGames - reviewGames

  return (
    <section className="results-day">
      <header className="results-day-header">
        <div className="day-title">
          <h3>{matchday.name}</h3>
          <span className="day-date">{matchday.date}</span>
        </div>

        <div className="results-day-summary">
          <span className="summary-pill total">{totalGames} partidos</span>
          {finishedGames > 0 && (
            <span className="summary-pill finished">{finishedGames} finalizados</span>
          )}
          {reviewGames > 0 && (
            <span className="summary-pill review">{reviewGames} por aprobar</span>
          )}
          {pendingGames > 0 && (
            <span className="summary-pill pending">{pendingGames} por jugar</span>
          )}
        </div>
      </header>

      <div className="results-grid">
        {matchday.games.map(match => (
          <ResultCard key={match.id} match={match} />
        ))}
      </div>

      {/* 👇 BYE */}
      {byeTeams.length > 0 && (
        <div className="bye-section">
          <span className="bye-label">Descansan:</span>
          <div className="bye-teams">
            {byeTeams.map(team => (
              <div key={team.id} className="bye-team">
                <img src={team.logo_url} alt={team.name} />
                <span>{team.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}


export default ResultsDay
