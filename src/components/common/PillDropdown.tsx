import { useEffect, useRef, useState } from 'react'
import './PillDropdown.css'

function PillDropdown({ options, activeId, onChange, placeholder = 'Seleccionar' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!options || options.length === 0) return null

  const active = options.find(o => String(o.id) === String(activeId))
  const canToggle = options.length > 1

  return (
    <div className="pill-dropdown" ref={rootRef}>
      <button
        type="button"
        className={`pill-dropdown-trigger ${open ? 'open' : ''} ${!canToggle ? 'static' : ''}`}
        onClick={() => canToggle && setOpen(prev => !prev)}
      >
        <span>{active?.label || placeholder}</span>
        {canToggle && (
          <svg className="pill-dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {canToggle && (
        <div className={`pill-dropdown-menu ${open ? 'open' : ''}`}>
          {options.map(option => (
            <button
              key={option.id}
              type="button"
              className={`pill-dropdown-option ${String(option.id) === String(activeId) ? 'active' : ''}`}
              onClick={() => { onChange(option); setOpen(false) }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PillDropdown
