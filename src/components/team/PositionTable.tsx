import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TeamLogo from '../common/TeamLogo'
import { getTeamColorStyle } from '../../utils/teamColorStyle'
import { calculateTeamGameLog } from '../../utils/calculateTeamGameLog'
import './PositionTable.css'
import './TeamFormStrip.css'

const RESULT_LABEL = { G: 'Ganado', P: 'Perdido', E: 'Empatado' }

function PositionTable({ table, matchdays = [], hideControls = false }) {
  const { leagueSlug } = useParams()
  const [showAllCols, setShowAllCols] = useState(false)

  if (table.length === 0) {
    return <p className="position-table-empty">Esta categoría aún no tiene equipos registrados</p>
  }

  return (
    <div>
      <div className="tabla-wrapper">
        <table className={`tabla-posiciones ${showAllCols ? 'expanded' : ''}`}>
          <thead>
            <tr>
              <th>Posición</th>
              <th>Equipo</th>
              <th title="Últimos 5 partidos">Racha</th>
              <th title="Partidos jugados">PJ</th>
              <th title="Partidos ganados">PG</th>
              <th title="Partidos empatados">PE</th>
              <th title="Partidos perdidos">PP</th>
              <th title="Puntos a favor">PA</th>
              <th title="Puntos en contra">PC</th>
              <th title="Diferencia de puntos">Diferencia</th>
              <th title="Promedio de puntos por partido">Promedio</th>
              <th title="Puntos en la tabla">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {table.map((fila, index) => {
              const recentForm = calculateTeamGameLog(fila.equipo, matchdays).slice(-5)

              return (
                <tr
                  key={fila.id ?? fila.equipo}
                  className={index === 0 && fila.pj > 0 ? 'leader' : ''}
                  style={getTeamColorStyle(fila.color)}
                >
                <td>{index + 1}</td>
                <td className="equipo-cell">
                  {fila.id && leagueSlug ? (
                    <Link to={`/${leagueSlug}/equipos/${fila.id}`} className="equipo-link">
                      <TeamLogo logoUrl={fila.logo} name={fila.equipo} alt={fila.equipo} className="team-logo" />
                      <span className="team-name">{fila.equipo}</span>
                    </Link>
                  ) : (
                    <span className="equipo-link">
                      <TeamLogo logoUrl={fila.logo} name={fila.equipo} alt={fila.equipo} className="team-logo" />
                      <span className="team-name">{fila.equipo}</span>
                    </span>
                  )}
                  {fila.divisionColor && (
                    <span
                      className="division-badge"
                      style={{ backgroundColor: fila.divisionColor }}
                      title={`División ${fila.divisionName}`}
                    >
                      {fila.divisionName}
                    </span>
                  )}
                </td>
                <td className="racha-cell">
                  {recentForm.length > 0 ? (
                    <div className="team-form-chips">
                      {recentForm.map(game => (
                        <span
                          key={game.id}
                          className={`team-form-chip result-${game.result}`}
                          title={`${RESULT_LABEL[game.result]} vs ${game.opponent} (${game.pointsFor}-${game.pointsAgainst})`}
                        >
                          {game.result}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="racha-empty">—</span>
                  )}
                </td>
                <td>{fila.pj}</td>
                <td>{fila.g}</td>
                <td>{fila.e}</td>
                <td>{fila.p}</td>
                <td>{fila.pf}</td>
                <td>{fila.pc}</td>
                <td>{fila.difference}</td>
                <td>{fila.average}</td>
                <td>{fila.puntos}</td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!hideControls && (
        <button
          type="button"
          className="cols-toggle-btn"
          onClick={() => setShowAllCols(prev => !prev)}
        >
          {showAllCols ? 'Ver menos columnas' : 'Ver todas las columnas'}
        </button>
      )}

      <p className="tabla-legend">
        PJ Jugados · PG Ganados · PE Empatados · PP Perdidos · PA Puntos a favor · PC Puntos en contra
      </p>
    </div>
  )
}

export default PositionTable
