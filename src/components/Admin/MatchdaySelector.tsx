import './MatchdaySelector.css'

function MatchdaySelector({ matchdays, value, onChange }) {
  return (
    <div className="matchday-selector">
      {matchdays.map(md => {
        const active = md.id === value?.id

        return (
          <button
            key={md.id}
            className={`matchday-pill ${active ? 'active' : ''}`}
            onClick={() => onChange({ id: md.id, name: md.name })}
          >
            {md.name}
          </button>
        )
      })}
    </div>
  )
}

export default MatchdaySelector
