import { Link, useParams } from 'react-router-dom'
import './PositionTable.css'

function PositionTable({ table }) {
  const { leagueSlug } = useParams()

  if (table.length === 0) {
    return <p className="position-table-empty">Esta categoría aún no tiene equipos registrados</p>
  }

  return (
    <div>
      <table className="tabla-posiciones">
        <thead>
          <tr>
            <th>Posición</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>PA</th>
            <th>PC</th>
            <th>Diferencia</th>
            <th>Promedio</th>
            <th>Puntos</th>
          </tr>
        </thead>
        <tbody>
          {table.map((fila, index) => (
              <tr key={fila.id ?? fila.equipo} className={index === 0 && fila.pj > 0 ? 'leader' : ''}>
              <td>{index + 1}</td>
              <td className="equipo-cell">
                {fila.id && leagueSlug ? (
                  <Link to={`/${leagueSlug}/equipos/${fila.id}`} className="equipo-link">
                    <img src={fila.logo} alt={fila.equipo} className="team-logo" loading="lazy" />
                    <span className="team-name">{fila.equipo}</span>
                  </Link>
                ) : (
                  <span className="equipo-link">
                    <img src={fila.logo} alt={fila.equipo} className="team-logo" loading="lazy" />
                    <span className="team-name">{fila.equipo}</span>
                  </span>
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
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PositionTable
