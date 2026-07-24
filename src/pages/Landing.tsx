import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import logo from '../assets/flagstatslogo.jpeg'
import InstallAppButton from '../components/common/InstallAppButton'

import { getActiveLeagues } from '../services/league.service'
import { applyLeagueBranding } from '../utils/applyLeagueBranding'
import { getDefaultLeagueSlug, setDefaultLeagueSlug } from '../utils/defaultLeague'

import './Landing.css'

function Landing() {
  const navigate = useNavigate()
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applyLeagueBranding(null, null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const data = await getActiveLeagues()
        if (cancelled) return

        const savedSlug = getDefaultLeagueSlug()
        const savedLeague = savedSlug && (data || []).find(l => l.slug === savedSlug)

        // Ya eligió su liga antes en este dispositivo: entra directo, sin
        // pasar por el selector.
        if (savedLeague) {
          navigate(`/${savedLeague.slug}`, { replace: true })
          return
        }

        setLeagues(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [navigate])

  function handleSelectLeague(slug) {
    setDefaultLeagueSlug(slug)
    navigate(`/${slug}`)
  }

  return (
    <div className="app-home">
      <div className="app-home-card">
        <img src={logo} alt="FlagStats" className="app-home-logo" />

        <InstallAppButton className="app-home-install-btn" />

        <h1 className="app-home-title">Elige tu liga</h1>
        <p className="app-home-subtitle">La próxima vez entrarás directo, sin pasar por aquí.</p>

        {loading && <p className="app-home-status">Cargando ligas...</p>}

        {!loading && leagues.length === 0 && (
          <p className="app-home-status">Todavía no hay ligas activas.</p>
        )}

        {!loading && leagues.length > 0 && (
          <div className="app-home-league-list">
            {leagues.map(league => (
              <button
                type="button"
                key={league.id}
                className="app-home-league-item"
                onClick={() => handleSelectLeague(league.slug)}
              >
                {league.image_url ? (
                  <img src={league.image_url} alt={league.name} className="app-home-league-logo" loading="lazy" />
                ) : (
                  <span className="app-home-league-logo app-home-league-logo-fallback">🏈</span>
                )}
                <span className="app-home-league-name">{league.name}</span>
                <span className="app-home-league-arrow">→</span>
              </button>
            ))}
          </div>
        )}

        <Link to="/nosotros" className="app-home-about-link">¿Qué es FlagStats?</Link>
      </div>
    </div>
  )
}

export default Landing
