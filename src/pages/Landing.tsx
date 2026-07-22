import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import Footer from '../components/common/Footer'
import logo from '../assets/flagstatslogo.jpeg'

import { getActiveLeagues } from '../services/league.service'
import { applyLeagueBranding } from '../utils/applyLeagueBranding'

import './Landing.css'

const FEATURES = [
  {
    title: 'Estadísticas en vivo',
    description: 'Touchdowns, pases, intercepciones y sacks, jornada a jornada.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20V10M12 20V4M20 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Tabla de posiciones',
    description: 'Se arma sola con cada resultado. Nada de hojas de cálculo.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 9.5h17M8 9.5V20" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  },
  {
    title: 'Calendario y resultados',
    description: 'Próximos partidos y resultados recientes, siempre a la mano.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="5" width="17" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Panel para tu liga',
    description: 'Equipos, jornadas, sedes, árbitros y usuarios, todo en un panel.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3 4 6.5v5c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9v-5L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }
]

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Landing() {
  const [leagues, setLeagues] = useState([])
  const [loadingLeagues, setLoadingLeagues] = useState(true)
  const trackRef = useRef(null)

  useEffect(() => {
    applyLeagueBranding(null, null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadLeagues() {
      try {
        const data = await getActiveLeagues()
        if (!cancelled) setLeagues(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoadingLeagues(false)
      }
    }

    loadLeagues()
    return () => { cancelled = true }
  }, [])

  function scrollLeagues(direction) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.landing-league-card')
    const step = card ? card.getBoundingClientRect().width + 16 : 200
    track.scrollBy({ left: direction * step * 2, behavior: 'smooth' })
  }

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-logo-wrap">
          <img src={logo} alt="FlagStats" className="landing-logo" />
        </div>
        <nav className="landing-nav-links">
          <button type="button" onClick={() => scrollToSection('features')}>Qué hacemos</button>
          <button type="button" onClick={() => scrollToSection('ligas')}>Ligas</button>
          <button type="button" onClick={() => scrollToSection('contacto')}>Contacto</button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <h1>Las estadísticas de tu liga de flag, sin complicarte</h1>
          <p className="landing-hero-subtitle">
            Calendario, resultados, tabla de posiciones y los líderes de la temporada, todo
            en una página lista para compartir con tus equipos.
          </p>
          <div className="landing-hero-actions">
            <button type="button" className="landing-btn landing-btn-primary" onClick={() => scrollToSection('ligas')}>
              Busca tu liga
            </button>
            <button type="button" className="landing-btn landing-btn-secondary" onClick={() => scrollToSection('contacto')}>
              Súmate a FlagStats
            </button>
          </div>
        </div>

        <div className="landing-mockup" aria-hidden="true">
          <div className="landing-mockup-window">
            <div className="landing-mockup-dots">
              <span /><span /><span />
            </div>
            <div className="landing-mockup-body">
              <div className="landing-mockup-table">
                <div className="landing-mockup-table-title">Tabla de posiciones</div>
                {[1, 2, 3, 4].map(row => (
                  <div className="landing-mockup-row" key={row}>
                    <span className="landing-mockup-row-label" />
                    <span className="landing-mockup-bar" style={{ width: `${100 - row * 15}%` }} />
                  </div>
                ))}
              </div>
              <div className="landing-mockup-score">
                <div className="landing-mockup-score-title">Próximo partido</div>
                <div className="landing-mockup-score-teams">
                  <span className="landing-mockup-team" />
                  <span className="landing-mockup-vs">vs</span>
                  <span className="landing-mockup-team" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section landing-features-section">
        <div className="landing-features-grid">
          {FEATURES.map(feature => (
            <div className="landing-feature-card" key={feature.title}>
              <div className="landing-feature-icon">{feature.icon}</div>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="ligas" className="landing-section">
        <h2 className="landing-section-title">¿Ya tienes tu liga aquí?</h2>
        <p className="landing-section-subtitle">
          Entra directo a su calendario, tabla y estadísticas.
        </p>

        {loadingLeagues && <p className="landing-leagues-status">Cargando ligas...</p>}

        {!loadingLeagues && leagues.length === 0 && (
          <p className="landing-leagues-status">Muy pronto verás aquí a las ligas de FlagStats.</p>
        )}

        {!loadingLeagues && leagues.length > 0 && (
          <div className="landing-leagues-slider">
            <button
              type="button"
              className="landing-slider-arrow"
              onClick={() => scrollLeagues(-1)}
              aria-label="Ver ligas anteriores"
            >
              ‹
            </button>

            <div className="landing-leagues-track" ref={trackRef}>
              {leagues.map(league => (
                <Link to={`/${league.slug}`} className="landing-league-card" key={league.id}>
                  {league.image_url ? (
                    <img src={league.image_url} alt={league.name} className="landing-league-logo" />
                  ) : (
                    <span className="landing-league-logo landing-league-logo-fallback">🏈</span>
                  )}
                  <span className="landing-league-name">{league.name}</span>
                  <span className="landing-league-link">Ver liga →</span>
                </Link>
              ))}
            </div>

            <button
              type="button"
              className="landing-slider-arrow"
              onClick={() => scrollLeagues(1)}
              aria-label="Ver más ligas"
            >
              ›
            </button>
          </div>
        )}
      </section>

      <section id="contacto" className="landing-contact-bar">
        <div className="landing-contact-text">
          <h2>¿Quieres subir tu liga a FlagStats?</h2>
          <p>Mándanos un mensaje y la ponemos a andar.</p>
        </div>

        <div className="landing-contact-actions">
          <a href="mailto:mrosie.rose13@gmail.com" className="landing-btn landing-btn-primary">
            <svg className="landing-contact-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 5.5A1.5 1.5 0 0 1 4 4h12a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5v-9Z" stroke="currentColor" strokeWidth="1.3" />
              <path d="M3 5.5 10 11l7-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            mrosie.rose13@gmail.com
          </a>

          <a href="https://wa.me/525566058537" target="_blank" rel="noreferrer" className="landing-btn landing-btn-secondary">
            <svg className="landing-contact-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17.5 4.1 13.7A7 7 0 1 1 7.2 16.4L3 17.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M7.3 8.7c0 2.5 2.1 4.6 4.6 4.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            +52 55 6605 8537
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
