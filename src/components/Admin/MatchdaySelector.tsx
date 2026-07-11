import PillDropdown from '../common/PillDropdown'
import './MatchdaySelector.css'

function MatchdaySelector({ matchdays, value, onChange }) {
  if (!matchdays || matchdays.length === 0) return null

  const options = matchdays.map(md => ({ id: md.id, label: md.name, original: md }))

  return (
    <div className="matchday-selector">
      <PillDropdown
        options={options}
        activeId={value?.id}
        onChange={option => onChange({ id: option.original.id, name: option.original.name })}
      />
    </div>
  )
}

export default MatchdaySelector
