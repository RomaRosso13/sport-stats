import { Link } from 'react-router-dom'
import { useState } from 'react'

import { useSeason } from '../../context/SeasonContext'
import { useAuth } from "../../context/AuthContext"
import { signOut } from '../../services/auth.service'

import SeasonSelector from '../filters/SeasonSelector'
import LoginForm from '../auth/LoginForm'

import './Header.css'

function Header({ league }) {
  const { user } = useAuth()
  const { seasons, season, setSeason, loading } = useSeason()

  const [menuOpen, setMenuOpen] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)

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
        <img
          src={league.image_url}
          alt={league.name}
          className="league-logo"
        />

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
            <div className="dropdown-menu open">
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
              <Link to={`/${league.slug}/estadisticas`} onClick={() => setMenuOpen(false)}>
                Estadísticas
              </Link>
              <Link to={`/${league.slug}/equipos`} onClick={() => setMenuOpen(false)}>
                Equipos
              </Link>

              {user && (
                <>
                  <hr />
                  <Link to={`/${league.slug}/admin`} onClick={() => setMenuOpen(false)}>
                    Panel de Administración
                  </Link>
                  <Link to={`/${league.slug}/admin/gestor`} onClick={() => setMenuOpen(false)}>
                    Gestor de temporadas
                  </Link>
                  <Link to={`/${league.slug}/admin/crear`} onClick={() => setMenuOpen(false)}>
                    Gestor de Jornadas
                  </Link>
                  <Link to={`/${league.slug}/admin/editar`} onClick={() => setMenuOpen(false)}>
                    Registrar resultados
                  </Link>
                  <Link to={`/${league.slug}/admin/equipos`} onClick={() => setMenuOpen(false)}>
                    Gestor de Equipos
                  </Link>
                </>
              )}

              <hr />
              <a href="#">Reglamento</a>
            </div>
          )}
        </nav>

        {/* AUTH */}
        {!user ? (
          !showLoginForm ? (
            <button
              className="auth-btn"
              onClick={() => setShowLoginForm(true)}
            >
              Inicia sesión
            </button>
          ) : (
            <LoginForm onClose={() => setShowLoginForm(false)} />
          )
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
