import { useState } from 'react'
import './TeamSelect.css'

function TeamSelect({
  teams = [],
  value,
  onChange,
  placeholder = 'Seleccionar equipo',
  disabled = false
}) {
  const [open, setOpen] = useState(false)

  const selectedTeam = Array.isArray(teams)
    ? teams.find(t => String(t.id) === String(value))
    : null

  if (disabled) {
    return (
      <div className="team-select disabled">
        {selectedTeam ? selectedTeam.name : placeholder}
      </div>
    )
  }

  return (
    <div className="team-select">
      <button
        type="button"
        className="team-select-trigger"
        onClick={() => setOpen(prev => !prev)}
      >
        {selectedTeam ? (
          <>
            {selectedTeam.logo_url && (
              <img src={selectedTeam.logo_url} alt={selectedTeam.name} />
            )}
            <span>{selectedTeam.name}</span>
          </>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
      </button>

      {open && (
        <div className="team-select-dropdown">
          {Array.isArray(teams) && teams.length === 0 && (
            <div className="team-select-empty">
              No hay equipos
            </div>
          )}

          {Array.isArray(teams) && teams.map(team => (
            <button
              key={team.id}
              type="button"
              className="team-select-option"
              onClick={() => {
                onChange(team.id)
                setOpen(false)
              }}
            >
              {team.logo_url && (
                <img src={team.logo_url} alt={team.name} />
              )}
              <span>{team.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeamSelect
