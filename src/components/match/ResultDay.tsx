import ResultCard from "./ResultCard"
import TeamLogo from "../common/TeamLogo"
import "./ResultDay.css"

function ResultsDay({ matchday, teams, mvpByMatch = {} }) {
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

      {matchday.summary && (
        <div className="chronicle">
          <div className="chronicle-header">
            <svg className="chronicle-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2.5 11.4 7 16 8.4 11.4 9.8 10 14.3 8.6 9.8 4 8.4 8.6 7 10 2.5Z" fill="currentColor" />
              <path d="M16.2 12.3 16.8 14.2 18.7 14.8 16.8 15.4 16.2 17.3 15.6 15.4 13.7 14.8 15.6 14.2 16.2 12.3Z" fill="currentColor" />
            </svg>
            <span className="chronicle-label">Crónica de la jornada</span>
            <span className="chronicle-badge">Generado con IA</span>
          </div>
          <p className="chronicle-text">{matchday.summary}</p>
        </div>
      )}

      <div className="results-grid">
        {matchday.games.map(match => (
          <ResultCard key={match.id} match={match} mvp={mvpByMatch[match.id]} />
        ))}
      </div>

      {/* 👇 BYE */}
      {byeTeams.length > 0 && (
        <div className="bye-section">
          <span className="bye-label">Descansan:</span>
          <div className="bye-teams">
            {byeTeams.map(team => (
              <div key={team.id} className="bye-team">
                <TeamLogo logoUrl={team.logo_url} name={team.name} alt={team.name} className="bye-team-logo" />
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
