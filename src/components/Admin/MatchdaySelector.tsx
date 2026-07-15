import './MatchdaySelector.css'

function formatMatchdayDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(`${dateStr}T00:00:00`)
  const formatted = date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function MatchdaySelector({ matchdays, value, onChange }) {
  if (!matchdays || matchdays.length === 0) return null

  return (
    <div className="matchday-banner">
      <div className="matchday-banner-current">
        <span className="matchday-banner-eyebrow">Editando jornada</span>
        <span className="matchday-banner-name">
          {value?.name || 'Selecciona una jornada'}
        </span>
        {value?.date && (
          <span className="matchday-banner-date">{formatMatchdayDate(value.date)}</span>
        )}
      </div>

      {matchdays.length > 1 && (
        <select
          className="matchday-banner-select"
          value={value?.id ?? ''}
          onChange={(e) => {
            const selected = matchdays.find(md => String(md.id) === e.target.value)
            if (selected) onChange({ id: selected.id, name: selected.name, date: selected.date })
          }}
        >
          {matchdays.map(md => (
            <option key={md.id} value={md.id}>
              {md.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default MatchdaySelector
