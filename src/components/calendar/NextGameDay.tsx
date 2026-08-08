import { useMemo } from 'react'
import TeamLogo from '../common/TeamLogo'
import VenueLink from '../common/VenueLink'
import { getWinProbabilities, getWinProbColors } from '../../utils/getWinProbability'
import './NextGameDay.css'

function NextGameDay({ data, standings = [] }) {
  const standingsById = useMemo(
    () => Object.fromEntries(standings.map(row => [row.id, row])),
    [standings]
  )

  if (!data) {
    return <p className="empty">Temporada finalizada</p>
  }

  return (
    <div className="partidos-list">
      {data.games.map((p, index) => {
        const localRow = standingsById[p.local_team.id]
        const visitRow = standingsById[p.visit_team.id]
        const { local, visit } = getWinProbabilities(localRow, visitRow)
        const { local: localColor, visit: visitColor } = getWinProbColors(local, visit)

        return (
          <div className="partido-card" key={index}>

            {/* LOCAL */}
            <div className="equipo lado izquierdo">
              <TeamLogo logoUrl={p.local_team.logo_url} name={p.local_team.name} alt={p.local_team.name} className="team-logo" />
              <span>{p.local_team.name}</span>
            </div>

            <span className="vs">vs</span>

            {/* VISITANTE */}
            <div className="equipo lado derecho">
              <span>{p.visit_team.name}</span>
              <TeamLogo logoUrl={p.visit_team.logo_url} name={p.visit_team.name} alt={p.visit_team.name} className="team-logo" />
            </div>

            {/* PROBABILIDAD DE VICTORIA */}
            <div
              className="win-prob"
              title={`Probabilidad según historial: ${p.local_team.name} ${local}% · ${p.visit_team.name} ${visit}%`}
            >
              <span className="win-prob-pct local">{local}%</span>
              <div className="win-prob-bar">
                <span className="win-prob-fill" style={{ width: `${local}%`, background: localColor }} />
                <span className="win-prob-fill" style={{ width: `${visit}%`, background: visitColor }} />
              </div>
              <span className="win-prob-pct visit">{visit}%</span>
            </div>

            {/* META */}
            <div className="meta">
              <span>{p.matchday}</span>
              <span>·</span>
              <span>Sede: <VenueLink branch={p.branch} /></span>
              <span>·</span>
              <span>Campo: {p.field.name}</span>
              <span>·</span>
              <span>Fecha: {p.date}</span>
              <span>·</span>
              <span>Hora:{p.hour}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NextGameDay
