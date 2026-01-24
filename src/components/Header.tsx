import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useSeason } from '../context/SeasonContext'
import { useAuth } from "../context/AuthContext"
import { signOut } from '../services/auth.service'


import SeasonSelector from './SeasonSelector'
import LoginForm from './LoginForm'

import './Header.css'

function Header({ league }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { seasons, season, setSeason, loading } = useSeason()
  const [isLoginOpen, setLoginOpen] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)

  if (loading) return null
  if (!season) return null

  const { user } = useAuth()

  async function handleLogout() {
    try {
      await signOut()
      setShowLoginForm(false)
    } catch (err) {
      console.error(err.message)
    }
  }



  return (
    <header className="header-liga">
      <div className="header-left">
        <img src={league.image_url} alt="league" className="league-logo" />

        <div className="league-info">
          <h1 className="liga-nombre">{league.name}</h1>

          {seasons.length > 0 && (
            <SeasonSelector
              seasons={seasons}
              activeSeason={season}
              onChange={setSeason}
            />
          )}
        </div>
      </div>

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
            <div className={`dropdown-menu ${menuOpen ? 'open' : ''}`}>
              <Link to={`/${league.slug}`}>Inicio</Link>
              <Link to={`/${league.slug}/calendario`}>Calendario</Link>
              <Link to={`/${league.slug}/results`}>Resultados</Link>
              <Link to={`/${league.slug}/tabla`}>Tabla de Posiciones</Link>
              <Link to={`/${league.slug}/equipos`}>Equipos</Link>
              {user ? (
                <>
                  <hr/>
                  <Link to={`/${league.slug}/admin/crear`}>Crear jornadas</Link>
                  <Link to={`/${league.slug}/admin/editar`}>Editar jornadas</Link>
                </>
              ) : 
              <></>
              }
              <hr />
              <a href="#">Reglamento</a>
            </div>
          )}
        </nav>

        {!user ? (
          !showLoginForm ? (
            <button className="auth-btn" onClick={() => setShowLoginForm(true)}>
              Inicia sesión
            </button>
          ) : (
            <LoginForm onClose={() => setShowLoginForm(false)} />
          )
        ) : (
          <div className="user-actions">
            <span className="user-name">
              Bienvenid@! {user.email} 
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
