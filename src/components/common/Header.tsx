import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import { useSeason } from '../../context/SeasonContext'
import { useAuth } from "../../context/AuthContext"
import { useLeagueMembership } from '../../hooks/useLeagueMembership'
import { signOut } from '../../services/auth.service'
import { getUserByAuthId } from '../../services/league_user.service'
import { clearDefaultLeagueSlug } from '../../utils/defaultLeague'

import SeasonSelector from '../filters/SeasonSelector'
import LoginForm from '../auth/LoginForm'
import InstallAppButton from './InstallAppButton'
import AdminMenu from './AdminMenu'
import MobileNavDrawer from './MobileNavDrawer'
import ThemeToggle from './ThemeToggle'
import {
  HomeIcon, CalendarIcon, FootballIcon, TableIcon, TrophyIcon, StatsIcon, UsersIcon, BookIcon, CameraIcon,
  DashboardIcon, GearIcon, LayersIcon, ListIcon, EditIcon, ClipboardCheckIcon, MapPinIcon
} from './NavIcons'

import './Header.css'

const PUBLIC_NAV_ITEMS = [
  { to: '', label: 'Inicio', end: true, icon: HomeIcon },
  { to: '/calendario', label: 'Calendario', icon: CalendarIcon },
  { to: '/results', label: 'Partidos', icon: FootballIcon },
  { to: '/tabla', label: 'Tabla', icon: TableIcon },
  { to: '/playoffs', label: 'Playoffs', icon: TrophyIcon },
  { to: '/estadisticas', label: 'Estadísticas', icon: StatsIcon },
  { to: '/equipos', label: 'Equipos', icon: UsersIcon },
  { to: '/reglamento', label: 'Reglamento', icon: BookIcon },
  { to: '/fotos', label: 'Fotos', icon: CameraIcon }
]

// Mismos links y condiciones de rol que ya existían en el dropdown viejo —
// solo se movieron aquí para no duplicarlos entre AdminMenu (escritorio) y
// MobileNavDrawer (móvil). Agrupados por tema para que AdminMenu los pinte
// en secciones (MobileNavDrawer los sigue mostrando como una sola lista).
function getAdminNavGroups({ isFullAdmin, isReferee, isCoach }) {
  const general = []
  const temporada = []
  const partidos = []
  const equipos = []

  if (isFullAdmin) general.push({ to: '/admin', label: 'Panel de Administración', icon: DashboardIcon })
  if (isFullAdmin) general.push({ to: '/admin/configuracion', label: 'Configuración General', icon: GearIcon })
  if (isFullAdmin) general.push({ to: '/admin/usuarios', label: 'Gestor de Usuarios', icon: UsersIcon })

  if (isFullAdmin) temporada.push({ to: '/admin/gestor', label: 'Gestor de temporadas', icon: LayersIcon })
  if (isFullAdmin) temporada.push({ to: '/admin/crear', label: 'Gestor de Jornadas', icon: ListIcon })

  if (isFullAdmin || isReferee) partidos.push({ to: '/admin/editar', label: 'Registrar resultados', icon: EditIcon })
  if (isFullAdmin || isReferee) partidos.push({ to: '/admin/asistencia', label: 'Asistencia', icon: ClipboardCheckIcon })

  if (isFullAdmin) equipos.push({ to: '/admin/equipos', label: 'Gestor de Equipos', icon: UsersIcon })
  if (isFullAdmin) equipos.push({ to: '/admin/sedes', label: 'Gestor de Sedes', icon: MapPinIcon })
  if (isFullAdmin || isCoach) equipos.push({ to: '/admin/mi-equipo', label: 'Mi Equipo', icon: UsersIcon })

  return [
    { title: 'General', items: general },
    { title: 'Temporada', items: temporada },
    { title: 'Partidos', items: partidos },
    { title: 'Equipos y sedes', items: equipos }
  ].filter(group => group.items.length > 0)
}

function Header({ league }) {
  const { user } = useAuth()
  const { seasons, season, setSeason, loading } = useSeason()
  const { isMember, isFullAdmin, isReferee, isCoach } = useLeagueMembership()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const authRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    async function loadDisplayName() {
      if (!user?.id) {
        if (isMounted) setDisplayName('')
        return
      }

      try {
        const profile = await getUserByAuthId(user.id)
        if (isMounted) setDisplayName(profile?.name || '')
      } catch (err) {
        console.error(err)
      }
    }

    loadDisplayName()

    return () => {
      isMounted = false
    }
  }, [user?.id])

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

  const adminNavGroups = getAdminNavGroups({ isFullAdmin, isReferee, isCoach })
  const adminNavItemsFlat = adminNavGroups.flatMap(group => group.items)

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

          <ThemeToggle />

          <InstallAppButton className="auth-btn" />

          {isMember && (
            <AdminMenu leagueSlug={league.slug} groups={adminNavGroups} />
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
              <span className="header-user-name">
                Bienvenid@ {displayName || user.email}
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
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        leagueSlug={league.slug}
        publicItems={PUBLIC_NAV_ITEMS}
        adminItems={adminNavItemsFlat}
        isMember={isMember}
        onChangeLeague={handleChangeLeague}
        seasons={seasons}
        season={season}
        onChangeSeason={setSeason}
        user={user}
        displayName={displayName}
        onLogout={handleLogout}
      />
    </header>
  )
}

export default Header
