import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

import './AdminMenu.css'

// Menú de Administración, aparte de la navegación pública — solo escritorio
// (en móvil, estos mismos links viven dentro de MobileNavDrawer).
function AdminMenu({ leagueSlug, groups }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (groups.every(group => group.items.length === 0)) return null

  return (
    <div className="admin-menu" ref={ref}>
      <button
        type="button"
        className="admin-menu-trigger"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        Administración <span className="admin-menu-caret">▾</span>
      </button>

      {open && (
        <div className="admin-menu-dropdown">
          {groups.map(group => (
            <div className="admin-menu-group" key={group.title}>
              <span className="admin-menu-group-title">{group.title}</span>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={`/${leagueSlug}${item.to}`}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <item.icon />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminMenu
