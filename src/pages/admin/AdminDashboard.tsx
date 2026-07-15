import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import Loader from '../../components/common/Loader'
import PageWrapper from '../../components/common/PageWrapper'

import { useLeague } from '../../context/LeagueContext'
import { useSeason } from '../../context/SeasonContext'
import { useCategory } from '../../context/CategoryContext'

import { getTeamsByCategoryId } from '../../services/team.service.js'
import { getMatchDaysByCategoryId } from '../../services/matchday.service'
import { getMatchesByMatchDayIds } from '../../services/match.service'

import './AdminDashboard.css'

const QUICK_LINKS = [
  {
    to: 'admin/gestor',
    label: 'Gestor de Temporadas',
    description: 'Crea temporadas y categorías'
  },
  {
    to: 'admin/crear',
    label: 'Gestor de Jornadas',
    description: 'Crea jornadas y agrega partidos'
  },
  {
    to: 'admin/editar',
    label: 'Registrar Resultados',
    description: 'Captura marcadores y estadísticas'
  },
  {
    to: 'admin/equipos',
    label: 'Gestor de Equipos',
    description: 'Crea equipos y administra rosters'
  },
  {
    to: 'admin/sedes',
    label: 'Gestor de Sedes',
    description: 'Crea sedes y sus canchas'
  },
  {
    to: 'admin/usuarios',
    label: 'Gestor de Usuarios',
    description: 'Asigna roles de administración'
  }
]

const MAX_ALERTS = 6

function AdminDashboard() {
  const { league } = useLeague()
  const { season } = useSeason()
  const { categories } = useCategory()

  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setSummaries([])
      setLoading(false)
      return
    }

    async function loadDashboard() {
      try {
        setLoading(true)

        const results = await Promise.all(categories.map(async (category) => {
          const [teams, matchdaysData] = await Promise.all([
            getTeamsByCategoryId(category.id),
            getMatchDaysByCategoryId(category.id)
          ])

          const matchdayIds = matchdaysData.map(md => md.id)
          const matches = matchdayIds.length
            ? await getMatchesByMatchDayIds(matchdayIds)
            : []

          const matchesByMatchday = {}
          matches.forEach(m => {
            if (!matchesByMatchday[m.matchday_id]) matchesByMatchday[m.matchday_id] = []
            matchesByMatchday[m.matchday_id].push(m)
          })

          const pendingMatchdays = matchdaysData.filter(md =>
            (matchesByMatchday[md.id] || []).some(m => m.status === 'Pendiente')
          )

          const reviewMatchdays = matchdaysData.filter(md =>
            (matchesByMatchday[md.id] || []).some(m => m.status === 'Por aprobar')
          )

          const teamsWithoutPlayers = teams.filter(
            t => !(t.Player || []).some(p => p.active)
          )

          return {
            category,
            teamsCount: teams.length,
            activePlayersCount: teams.reduce(
              (sum, t) => sum + (t.Player || []).filter(p => p.active).length, 0
            ),
            finishedMatches: matches.filter(m => m.status === 'Terminado').length,
            pendingMatches: matches.filter(m => m.status === 'Pendiente').length,
            reviewMatches: matches.filter(m => m.status === 'Por aprobar').length,
            pendingMatchdays,
            reviewMatchdays,
            teamsWithoutPlayers
          }
        }))

        setSummaries(results)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [categories])

  const totals = summaries.reduce((acc, s) => ({
    teams: acc.teams + s.teamsCount,
    activePlayers: acc.activePlayers + s.activePlayersCount,
    finishedMatches: acc.finishedMatches + s.finishedMatches,
    pendingMatches: acc.pendingMatches + s.pendingMatches,
    reviewMatches: acc.reviewMatches + s.reviewMatches
  }), { teams: 0, activePlayers: 0, finishedMatches: 0, pendingMatches: 0, reviewMatches: 0 })

  const alerts = []

  summaries.forEach(s => {
    if (s.teamsCount === 0) {
      alerts.push({
        text: `La categoría ${s.category.type} aún no tiene equipos`,
        to: 'admin/equipos'
      })
    }

    s.pendingMatchdays.forEach(md => {
      alerts.push({
        text: `${s.category.type} · ${md.name} tiene partidos sin resultado`,
        to: 'admin/editar'
      })
    })

    s.reviewMatchdays.forEach(md => {
      alerts.push({
        text: `${s.category.type} · ${md.name} tiene resultados por aprobar`,
        to: 'admin/editar'
      })
    })

    s.teamsWithoutPlayers.forEach(team => {
      alerts.push({
        text: `${team.name} (${s.category.type}) no tiene jugadores activos`,
        to: 'admin/equipos'
      })
    })
  })

  const visibleAlerts = alerts.slice(0, MAX_ALERTS)
  const hiddenAlertsCount = alerts.length - visibleAlerts.length

  const isLoading = !league || !season || loading

  return (
    <div className="app-layout">
      <Loader show={isLoading} label="Cargando..." />
      <PageWrapper loading={isLoading}/>
      <Header league={league}/>

      <main className="admin-dashboard-container">
        <div className="admin-dashboard-intro">
          <h2>Panel de Administración</h2>
          <p>{league?.name} · {season?.name || 'Sin temporada activa'}</p>
        </div>

        <div className="quick-links-grid">
          {QUICK_LINKS.map(link => (
            <Link key={link.to} to={`/${league?.slug}/${link.to}`} className="quick-link-card">
              <span className="quick-link-label">{link.label}</span>
              <span className="quick-link-description">{link.description}</span>
            </Link>
          ))}
        </div>

        <div className="dashboard-summary-grid">
          <div className="summary-tile">
            <span className="summary-value">{categories?.length || 0}</span>
            <span className="summary-label">Categorías</span>
          </div>
          <div className="summary-tile">
            <span className="summary-value">{totals.teams}</span>
            <span className="summary-label">Equipos</span>
          </div>
          <div className="summary-tile">
            <span className="summary-value">{totals.activePlayers}</span>
            <span className="summary-label">Jugadores activos</span>
          </div>
          <div className="summary-tile">
            <span className="summary-value">{totals.finishedMatches}</span>
            <span className="summary-label">Partidos jugados</span>
          </div>
          <div className="summary-tile pending">
            <span className="summary-value">{totals.pendingMatches}</span>
            <span className="summary-label">Partidos pendientes</span>
          </div>
          {totals.reviewMatches > 0 && (
            <div className="summary-tile review">
              <span className="summary-value">{totals.reviewMatches}</span>
              <span className="summary-label">Por aprobar</span>
            </div>
          )}
        </div>

        <section className="alerts-section">
          <h3>Pendientes</h3>

          {!loading && alerts.length === 0 ? (
            <p className="alerts-empty">✓ Todo al día, no hay pendientes</p>
          ) : (
            <div className="alerts-list">
              {visibleAlerts.map((alert, index) => (
                <Link key={index} to={`/${league?.slug}/${alert.to}`} className="alert-item">
                  {alert.text}
                </Link>
              ))}
              {hiddenAlertsCount > 0 && (
                <p className="alerts-more">+{hiddenAlertsCount} pendientes más</p>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AdminDashboard
