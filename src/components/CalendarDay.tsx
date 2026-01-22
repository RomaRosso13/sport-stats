import MatchCard from "./MatchCard"
import "./CalendarDay.css"

function CalendarDay({ matchday }) {

  console.log('Matchday', matchday)
  return (
    <section className="calendar-day">
      <header className="calendar-day-header">
        <div className="day-info">
          <h3>{matchday.name}</h3>
          <span className="day-date">{matchday.date}</span>
        </div>
      </header>

      <div className="matches-grid">
        {matchday.games.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>

  )
}

export default CalendarDay
