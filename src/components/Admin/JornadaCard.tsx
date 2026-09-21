import './JornadaCard.css'

function formatJornadaDate(dateStr) {
  if (!dateStr) return 'Sin fecha'
  const date = new Date(`${dateStr}T00:00:00`)
  const formatted = date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function JornadaCard({ jornada, matchCount, onEdit, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  return (
    <div className="jornada-card">
      <div className="jornada-order-controls">
        <button
          type="button"
          className="jornada-order-btn"
          disabled={!canMoveUp}
          onClick={() => onMoveUp(jornada)}
          aria-label="Mover jornada hacia arriba"
        >
          ▲
        </button>
        <button
          type="button"
          className="jornada-order-btn"
          disabled={!canMoveDown}
          onClick={() => onMoveDown(jornada)}
          aria-label="Mover jornada hacia abajo"
        >
          ▼
        </button>
      </div>

      <h4>{jornada.name}</h4>
      <span className="jornada-card-date">{formatJornadaDate(jornada.date)}</span>

      <span className={`jornada-card-count ${matchCount === 0 ? 'empty' : ''}`}>
        {matchCount === 0 ? 'Sin partidos aún' : `${matchCount} partido${matchCount === 1 ? '' : 's'}`}
      </span>

      <div className="jornada-card-actions">
        <button type="button" className="jornada-edit-btn" onClick={() => onEdit(jornada)}>
          Editar
        </button>
        <button type="button" className="jornada-delete-btn" onClick={() => onDelete(jornada)}>
          Eliminar
        </button>
      </div>
    </div>
  )
}

export default JornadaCard
