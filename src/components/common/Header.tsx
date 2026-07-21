import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import { useSeason } from '../../context/SeasonContext'
import { useAuth } from "../../context/AuthContext"
import { useLeagueMembership } from '../../hooks/useLeagueMembership'
import { signOut } from '../../services/auth.service'

import SeasonSelector from '../filters/SeasonSelector'
import LoginForm from '../auth/LoginForm'

import './Header.css'

function Header({ league }) {
  const { user } = useAuth()
  const { seasons, season, setSeason, loading } = useSeason()
  const { isMember, isFullAdmin, isReferee, isPhotographer, isCoach } = useLeagueMembership()

  const [menuOpen, setMenuOpen] = useState(false)
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

async function handleLogout() {
  try {
    await signOut()
    setShowLoginForm(false)
    setMenuOpen(false)


    window.location.href = `/${league.slug}`
    
  } catch (err) {
    console.error(err.message)
  }
}


  return (
    <header className="header-liga">
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

          {/* Selector solo si hay temporada */}
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
        <nav className="nav">
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            ☰
          </button>

          {menuOpen && (
            <div className={`dropdown-menu open ${isMember ? 'has-admin' : ''}`}>
              <div className="menu-section">
                {isMember && <span className="menu-section-title">Navegación</span>}
                <Link to={`/${league.slug}`} onClick={() => setMenuOpen(false)}>
                  Inicio
                </Link>
                <Link to={`/${league.slug}/calendario`} onClick={() => setMenuOpen(false)}>
                  Calendario
                </Link>
                <Link to={`/${league.slug}/results`} onClick={() => setMenuOpen(false)}>
                  Partidos
                </Link>
                <Link to={`/${league.slug}/tabla`} onClick={() => setMenuOpen(false)}>
                  Tabla de Posiciones
                </Link>
                <Link to={`/${league.slug}/playoffs`} onClick={() => setMenuOpen(false)}>
                  Playoffs
                </Link>
                <Link to={`/${league.slug}/estadisticas`} onClick={() => setMenuOpen(false)}>
                  Estadísticas
                </Link>
                <Link to={`/${league.slug}/equipos`} onClick={() => setMenuOpen(false)}>
                  Equipos
                </Link>
                <hr />
                <Link to={`/${league.slug}/reglamento`} onClick={() => setMenuOpen(false)}>
                  Reglamento
                </Link>
              </div>

              {isMember && (
                <div className="menu-section admin-section">
                  <span className="menu-section-title">Administración</span>
                  {isFullAdmin && (
                    <Link to={`/${league.slug}/admin`} onClick={() => setMenuOpen(false)}>
                      Panel de Administración
                    </Link>
                  )}
                  {isFullAdmin && (
                    <Link to={`/${league.slug}/admin/gestor`} onClick={() => setMenuOpen(false)}>
                      Gestor de temporadas
                    </Link>
                  )}
                  {isFullAdmin && (
                    <Link to={`/${league.slug}/admin/crear`} onClick={() => setMenuOpen(false)}>
                      Gestor de Jornadas
                    </Link>
                  )}
                  {(isFullAdmin || isReferee) && (
                    <Link to={`/${league.slug}/admin/editar`} onClick={() => setMenuOpen(false)}>
                      Registrar resultados
                    </Link>
                  )}
                  {isFullAdmin && (
                    <Link to={`/${league.slug}/admin/equipos`} onClick={() => setMenuOpen(false)}>
                      Gestor de Equipos
                    </Link>
                  )}
                  {isFullAdmin && (
                    <Link to={`/${league.slug}/admin/sedes`} onClick={() => setMenuOpen(false)}>
                      Gestor de Sedes
                    </Link>
                  )}
                  {isFullAdmin && (
                    <Link to={`/${league.slug}/admin/usuarios`} onClick={() => setMenuOpen(false)}>
                      Gestor de Usuarios
                    </Link>
                  )}
                  {(isFullAdmin || isPhotographer) && (
                    <Link to={`/${league.slug}/admin/fotos`} onClick={() => setMenuOpen(false)}>
                      Gestión de Fotos
                    </Link>
                  )}
                  {isFullAdmin && (
                    <Link to={`/${league.slug}/admin/configuracion`} onClick={() => setMenuOpen(false)}>
                      Configuración General
                    </Link>
                  )}
                  {(isFullAdmin || isCoach) && (
                    <Link to={`/${league.slug}/admin/mi-equipo`} onClick={() => setMenuOpen(false)}>
                      Mi Equipo
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* AUTH */}
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
      </div>
    </header>
  )
}

export default Header
