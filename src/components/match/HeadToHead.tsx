import { calculateHeadToHead } from '../../utils/calculateHeadToHead'
import './HeadToHead.css'

function HeadToHead({ matches, localTeam, visitTeam }) {
  if (!matches || matches.length === 0) {
    return <p className="h2h-empty">Sin enfrentamientos previos entre estos equipos</p>
  }

  const { rows, winsLocal, winsVisit, draws } = calculateHeadToHead(matches, localTeam.id)

  return (
    <div className="h2h">
      <div className="h2h-summary">
        <div className="h2h-summary-item">
          <span className="h2h-summary-value">{winsLocal}</span>
          <span className="h2h-summary-label">{localTeam.name}</span>
        </div>

        {draws > 0 && (
          <div className="h2h-summary-item">
            <span className="h2h-summary-value">{draws}</span>
            <span className="h2h-summary-label">Empates</span>
          </div>
        )}

        <div className="h2h-summary-item">
          <span className="h2h-summary-value">{winsVisit}</span>
          <span className="h2h-summary-label">{visitTeam.name}</span>
        </div>
      </div>

      <ul className="h2h-list">
        {rows.slice(0, 5).map(row => (
          <li key={row.id} className="h2h-row">
            <span className="h2h-date">{row.date}</span>
            <span className="h2h-score">
              <span className={row.scoreLocal > row.scoreVisit ? 'winner' : ''}>{row.scoreLocal}</span>
              <span className="h2h-score-dash">-</span>
              <span className={row.scoreVisit > row.scoreLocal ? 'winner' : ''}>{row.scoreVisit}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HeadToHead
