import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useSeason } from '../context/SeasonContext'
import SeasonSelector from './SeasonSelector'
import './Header.css'

function Header({ league }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // ✅ TODO viene del context
  const { seasons, season, setSeason, loading } = useSeason()

  if (loading) return null
  if (!season) return null

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
            <div className="dropdown-menu">
              <Link to={`/${league.slug}`}>Inicio</Link>
              <Link to={`/${league.slug}/calendario`}>Calendario</Link>
              <Link to={`/${league.slug}/results`}>Resultados</Link>
              <Link to={`/${league.slug}/tabla`}>Tabla de Posiciones</Link>
              <Link to={`/${league.slug}/equipos`}>Equipos</Link>
              <hr />
              <a href="#">Reglamento</a>
            </div>
          )}
        </nav>

        <button className="login-btn">Login</button>
      </div>
    </header>
  )
}

export default Header
