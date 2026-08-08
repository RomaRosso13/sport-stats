import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import ThemeToggle from './ThemeToggle'
import InstallAppButton from './InstallAppButton'
import SeasonSelector from '../filters/SeasonSelector'
import LoginForm from '../auth/LoginForm'

import './MobileNavDrawer.css'

// Temporada, tema, instalar app y cuenta viven aquí (y no en el header) para
// que la barra superior en móvil quede en una sola fila: logo + nombre +
// hamburguesa. Ver Header.css para las reglas que ocultan esos controles
// del header en pantallas angostas.
function MobileNavDrawer({
  open, onClose, leagueSlug, publicItems, adminItems, isMember, onChangeLeague,
  seasons, season, onChangeSeason, user, displayName, onLogout
}) {
  const [showLoginForm, setShowLoginForm] = useState(false)

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

  useEffect(() => {
    if (!open) setShowLoginForm(false)
  }, [open])

  if (!open) return null

  return (
    <>
      <div className="nav-drawer-scrim" onClick={onClose} />

      <div className="nav-drawer" role="dialog" aria-modal="true" aria-label="Menú">
        <button type="button" className="nav-drawer-close" onClick={onClose} aria-label="Cerrar menú">
          ×
        </button>

        <div className="nav-drawer-toolbar">
          <ThemeToggle />
          <InstallAppButton className="menu-link-btn nav-drawer-install-btn" />
        </div>

        {season && seasons?.length > 0 && (
          <div className="nav-drawer-season">
            <span className="menu-section-title">Temporada</span>
            <SeasonSelector seasons={seasons} activeSeason={season} onChange={onChangeSeason} />
          </div>
        )}

        <span className="menu-section-title">Cuenta</span>
        <div className="nav-drawer-account">
          {!user ? (
            showLoginForm ? (
              <LoginForm onClose={() => setShowLoginForm(false)} />
            ) : (
              <button type="button" className="menu-link-btn" onClick={() => setShowLoginForm(true)}>
                Iniciar sesión
              </button>
            )
          ) : (
            <>
              <span className="nav-drawer-user-name">Bienvenid@ {displayName || user.email}</span>
              <button type="button" className="menu-link-btn" onClick={onLogout}>
                Cerrar sesión
              </button>
            </>
          )}
        </div>

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
            <item.icon />
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
                <item.icon />
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
