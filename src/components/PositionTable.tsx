import './PositionTable.css'

function PositionTable({ table }) {
  return (
    <div>
      <table className="tabla-posiciones">
        <thead>
          <tr>
            <th>Posición</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>PG</th>
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
              <tr key={fila.equipo} className={index === 0 ? 'leader' : ''}>
              <td>{index + 1}</td>
              <td className="equipo-cell">
                <img src={fila.logo} alt={fila.equipo} className="team-logo" />
                <span className="team-name">{fila.equipo}</span>
              </td>
              <td>{fila.pj}</td>
              <td>{fila.g}</td>
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
