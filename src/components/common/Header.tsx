import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import { useSeason } from '../../context/SeasonContext'
import { useAuth } from "../../context/AuthContext"
import { useLeagueMembership } from '../../hooks/useLeagueMembership'
import { signOut } from '../../services/auth.service'
import { clearDefaultLeagueSlug } from '../../utils/defaultLeague'

import SeasonSelector from '../filters/SeasonSelector'
import LoginForm from '../auth/LoginForm'
import InstallAppButton from './InstallAppButton'
import AdminMenu from './AdminMenu'
import MobileNavDrawer from './MobileNavDrawer'

import './Header.css'

const PUBLIC_NAV_ITEMS = [
  { to: '', label: 'Inicio', end: true },
  { to: '/calendario', label: 'Calendario' },
  { to: '/results', label: 'Partidos' },
  { to: '/tabla', label: 'Tabla' },
  { to: '/playoffs', label: 'Playoffs' },
  { to: '/estadisticas', label: 'Estadísticas' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/reglamento', label: 'Reglamento' },
  { to: '/fotos', label: 'Fotos' }
]

// Mismos links y condiciones de rol que ya existían en el dropdown viejo —
// solo se movieron aquí para no duplicarlos entre AdminMenu (escritorio) y
// MobileNavDrawer (móvil).
function getAdminNavItems({ isFullAdmin, isReferee, isCoach }) {
  const items = []

  if (isFullAdmin) items.push({ to: '/admin', label: 'Panel de Administración' })
  if (isFullAdmin) items.push({ to: '/admin/gestor', label: 'Gestor de temporadas' })
  if (isFullAdmin) items.push({ to: '/admin/crear', label: 'Gestor de Jornadas' })
  if (isFullAdmin || isReferee) items.push({ to: '/admin/editar', label: 'Registrar resultados' })
  if (isFullAdmin || isReferee) items.push({ to: '/admin/asistencia', label: 'Asistencia' })
  if (isFullAdmin) items.push({ to: '/admin/equipos', label: 'Gestor de Equipos' })
  if (isFullAdmin) items.push({ to: '/admin/sedes', label: 'Gestor de Sedes' })
  if (isFullAdmin) items.push({ to: '/admin/usuarios', label: 'Gestor de Usuarios' })
  if (isFullAdmin) items.push({ to: '/admin/configuracion', label: 'Configuración General' })
  if (isFullAdmin || isCoach) items.push({ to: '/admin/mi-equipo', label: 'Mi Equipo' })

  return items
}

function Header({ league }) {
  const { user } = useAuth()
  const { seasons, season, setSeason, loading } = useSeason()
  const { isMember, isFullAdmin, isReferee, isCoach } = useLeagueMembership()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const authRef = useRef(null)

  useEffect(() => {
    if (!showLoginForm) return

    function handleClickOutside(e) {
      if (authRef.current && !authRef.current.contains(e.target)) {
        setShowLoginForm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLoginForm])

  if (loading) return null
  if (!league) return null

  function handleChangeLeague() {
    clearDefaultLeagueSlug()
    window.location.href = '/'
  }

  async function handleLogout() {
    try {
      await signOut()
      setShowLoginForm(false)
      setDrawerOpen(false)
      window.location.href = `/${league.slug}`
    } catch (err) {
      console.error(err.message)
    }
  }

  const adminNavItems = getAdminNavItems({ isFullAdmin, isReferee, isCoach })

  return (
    <header className="header-liga">
      <div className="header-top">
        {/* IZQUIERDA */}
        <div className="header-left">
          <div className="league-logo-badge">
            <img
              src={league.image_url}
              alt={league.name}
              className="league-logo"
            />
          </div>

          <div className="league-info">
            <h1 className="liga-nombre">{league.name}</h1>

            {season && seasons.length > 0 && (
              <SeasonSelector
                seasons={seasons}
                activeSeason={season}
                onChange={setSeason}
              />
            )}
          </div>
        </div>

        {/* DERECHA */}
        <div className="header-right">
          <button type="button" className="change-league-btn" onClick={handleChangeLeague}>
            Cambiar de liga
          </button>

          <InstallAppButton className="auth-btn" />

          {isMember && (
            <AdminMenu leagueSlug={league.slug} items={adminNavItems} />
          )}

          {!user ? (
            <div className="auth-popover-wrapper" ref={authRef}>
              <button
                className="auth-btn"
                onClick={() => setShowLoginForm(prev => !prev)}
              >
                Inicia sesión
              </button>

              {showLoginForm && (
                <LoginForm onClose={() => setShowLoginForm(false)} />
              )}
            </div>
          ) : (
            <div className="user-actions">
              <span className="user-name">
                Bienvenid@ {user.email}
              </span>
              <button className="auth-btn" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          )}

          <button
            type="button"
            className="menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
      </div>

      <nav className="primary-nav">
        {PUBLIC_NAV_ITEMS.map(item => (
          <NavLink
            key={item.to || 'home'}
            to={`/${league.slug}${item.to}`}
            end={item.end}
            className={({ isActive }) => `primary-nav-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        leagueSlug={league.slug}
        publicItems={PUBLIC_NAV_ITEMS}
        adminItems={adminNavItems}
        isMember={isMember}
        onChangeLeague={handleChangeLeague}
      />
    </header>
  )
}

export default Header
