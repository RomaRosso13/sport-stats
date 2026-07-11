import type { CSSProperties } from "react"
import "./CalendarDay.css"

function CalendarDay({ matchday }) {

  /* =========================
     CONFIG
  ========================= */
  const START_HOUR = 7
  const END_HOUR = 12
  const STEP = 20
  const MATCH_DURATION = 40

  /* =========================
     HELPERS
  ========================= */

  function formatMatchdayDate(dateStr) {
    if (!dateStr) return ""
    const date = new Date(`${dateStr}T00:00:00`)
    const formatted = date.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long"
    })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  function generateHours(start, end, step) {
    const hours = []
    for (let h = start; h < end; h++) {
      for (let m = 0; m < 60; m += step) {
        hours.push(
          `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}`
        )
      }
    }
    return hours
  }

  function groupGamesByField(games) {
    const map: Record<string, { id: string; name: string; branch: string; games: typeof games }> = {}
    games.forEach(game => {
      const fieldId = game.field_id
      if (!map[fieldId]) {
        map[fieldId] = {
          id: fieldId,
          name: game.field.name,
          branch: game.branch.name,
          games: []
        }
      }
      map[fieldId].games.push(game)
    })
    return Object.values(map)
  }

  function normalizeToSlot(time, step) {
    const [h, m] = time.split(":").map(Number)
    const rounded = Math.floor(m / step) * step
    return `${h.toString().padStart(2, "0")}:${rounded
      .toString()
      .padStart(2, "0")}`
  }

  function getMatchesStartingAt(games, hour) {
    return games.filter(
      game => normalizeToSlot(game.hour, STEP) === hour
    )
  }

  function addMinutes(time, minutes) {
    const [h, m] = time.split(":").map(Number)
    const d = new Date()
    d.setHours(h, m + minutes, 0, 0)
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`
  }

  function getOccupiedSlots(match, step, duration) {
    const slots = []
    let current = normalizeToSlot(match.hour, step)
    for (let i = 0; i < duration; i += step) {
      slots.push(current)
      current = addMinutes(current, step)
    }
    return slots
  }

  function getOffsetPercent(time, step) {
    const [, minutes] = time.split(":").map(Number)
    return (minutes % step) / step
  }

  /* =========================
     DATA
  ========================= */

  const hours = generateHours(START_HOUR, END_HOUR, STEP)
  const fields = groupGamesByField(matchday.games)

  const totalMatches = matchday.games.length
  const finishedMatches = matchday.games.filter(g => g.status === "Terminado").length

  /* =========================
     RENDER
  ========================= */

  return (
    <section className="calendar-table-day" id={`jornada-${matchday.id}`}>
      <header className="calendar-table-header">
        <div className="calendar-table-title">
          <h3>{matchday.name}</h3>
          <span className="calendar-table-date">{formatMatchdayDate(matchday.date)}</span>
        </div>

        <div className="calendar-table-summary">
          <span className="summary-pill total">{totalMatches} partidos</span>
          {finishedMatches > 0 && (
            <span className="summary-pill finished">{finishedMatches} terminados</span>
          )}
          {totalMatches - finishedMatches > 0 && (
            <span className="summary-pill pending">{totalMatches - finishedMatches} por jugar</span>
          )}
        </div>
      </header>

      <div className="calendar-table-wrapper">
        <div
          className="calendar-table"
          style={{ "--hours-count": hours.length } as CSSProperties}
        >

          {/* HEADER HORAS */}
          <div className="row header">
            <div className="cell field sticky" />
            {hours.map(hour => (
              <div key={hour} className="cell hour sticky-top">
                {hour}
              </div>
            ))}
          </div>

          {/* CANCHAS */}
          {fields.map(field => {
            const occupied = new Set()

            return (
              <div key={field.id} className="row">
                <div className="cell field sticky">
                  <span className="field-name">{field.name}</span>
                  <span className="field-branch">{field.branch}</span>
                </div>

                {hours.map(hour => {
                  if (occupied.has(hour)) return null

                  const matches = getMatchesStartingAt(field.games, hour)

                  if (matches.length === 0) {
                    return <div key={hour} className="cell empty" />
                  }

                  const slots = getOccupiedSlots(
                    matches[0],
                    STEP,
                    MATCH_DURATION
                  )

                  slots.forEach(s => occupied.add(s))

                  return (
                    <div
                      key={hour}
                      className="cell match multi"
                      style={{
                        gridColumn: `span ${slots.length}`
                      }}
                    >
                      {matches.map(match => {
                        const offset = getOffsetPercent(match.hour, STEP)
                        const isFinished = match.status === "Terminado"
                        const localWon = isFinished && match.local_points > match.visit_points
                        const visitWon = isFinished && match.visit_points > match.local_points

                        return (
                          <div
                            key={match.id}
                            className={`match-item ${isFinished ? "finished" : "pending"}`}
                            style={{
                              transform: `translateX(${offset * 100}%)`
                            }}
                          >
                            <div className="match-text">
                              <div className="match-hour">{match.hour.slice(0, 5)}</div>

                              <div className={`team-row ${localWon ? "winner" : ""}`}>
                                <img src={match.local_team.logo_url} alt="" className="team-logo" />
                                <span className="team-name" title={match.local_team.name}>{match.local_team.name}</span>
                                {isFinished && <span className="team-score">{match.local_points}</span>}
                              </div>

                              {isFinished ? (
                                <div className="score-divider">–</div>
                              ) : (
                                <div className="vs">vs</div>
                              )}

                              <div className={`team-row ${visitWon ? "winner" : ""}`}>
                                <img src={match.visit_team.logo_url} alt="" className="team-logo" />
                                <span className="team-name" title={match.visit_team.name}>{match.visit_team.name}</span>
                                {isFinished && <span className="team-score">{match.visit_points}</span>}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CalendarDay
