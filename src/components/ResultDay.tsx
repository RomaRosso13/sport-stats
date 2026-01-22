import ResultCard from "./ResultCard"
import "./ResultDay.css"

function ResultsDay({ matchday }) {
  return (
    <section className="results-day">
      <header className="results-day-header">
        <div className="day-title">
          <h3>{matchday.name}</h3>
          <span className="day-date">{matchday.date}</span>
        </div>
      </header>

      <div className="results-grid">
        {matchday.games.map(match => (
          <ResultCard key={match.id} match={match} />
        ))}
      </div>
    </section>

  )
}

export default ResultsDay
