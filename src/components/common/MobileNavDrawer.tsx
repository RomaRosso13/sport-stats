import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'

import './MobileNavDrawer.css'

function MobileNavDrawer({ open, onClose, leagueSlug, publicItems, adminItems, isMember, onChangeLeague }) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="nav-drawer-scrim" onClick={onClose} />

      <div className="nav-drawer" role="dialog" aria-modal="true" aria-label="Menú">
        <button type="button" className="nav-drawer-close" onClick={onClose} aria-label="Cerrar menú">
          ×
        </button>

        <button type="button" className="menu-link-btn" onClick={onChangeLeague}>
          Cambiar de liga
        </button>

        <span className="menu-section-title">Navegación</span>
        {publicItems.map(item => (
          <NavLink
            key={item.to || 'home'}
            to={`/${leagueSlug}${item.to}`}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            {item.label}
          </NavLink>
        ))}

        {isMember && adminItems.length > 0 && (
          <>
            <span className="menu-section-title">Administración</span>
            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={`/${leagueSlug}${item.to}`}
                onClick={onClose}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </div>
    </>
  )
}

export default MobileNavDrawer
