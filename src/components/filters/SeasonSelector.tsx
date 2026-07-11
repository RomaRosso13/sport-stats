import './SeasonSelector.css'

function SeasonSelector({ seasons, activeSeason, onChange }) {
  if (!activeSeason) return null

  return (
    <select
      className="season-selector"
      value={String(activeSeason.id)}
      onChange={(e) => {
        const value = e.target.value

        const selected = seasons.find(
          s => String(s.id) === value
        )

        if (!selected) return

        onChange(selected)
      }}
    >
      {seasons.map(season => (
        <option key={season.id} value={String(season.id)}>
          {season.name}
        </option>
      ))}
    </select>
  )
}




export default SeasonSelector
