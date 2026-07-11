import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import Header from '../components/common/Header'
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'

import { getMatchById } from '../services/match.service'
import { getIndividualStatsByMatchId } from '../services/individual_stats.service'
import { STAGE_LABELS } from '../utils/matchStages'

import './MatchDetail.css'

const STAT_SECTIONS = [
  { key: 'touchdown', label: 'Touchdowns' },
  { key: 'touchdown_pass', label: 'Pases de TD' },
  { key: 'interceptions', label: 'Intercepciones' },
  { key: 'sacks', label: 'Sacks' }
]

function buildTeamBoxScore(stats, teamId) {
  const rows = stats.filter(row => String(row.team_id) === String(teamId))

  return STAT_SECTIONS
    .map(({ key, label }) => ({
      key,
      label,
      players: rows
        .filter(row => (row[key] || 0) > 0)
        .map(row => ({ name: row.player.name, value: row[key] }))
        .sort((a, b) => b.value - a.value)
    }))
    .filter(section => section.players.length > 0)
}

function MatchDetail() {
  const { league } = useLeague()
  const { matchId } = useParams()

  const [match, setMatch] = useState(null)
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return

    async function loadMatch() {
      try {
        setLoading(true)

        const matchData = await getMatchById(matchId)
        setMatch(matchData)

        const statsData = await getIndividualStatsByMatchId(matchId)
        setStats(statsData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadMatch()
  }, [matchId])

  const isPendiente = match?.status === 'Pendiente'
  const localGano = !!match && !isPendiente && match.local_points > match.visit_points
  const visitanteGano = !!match && !isPendiente && match.visit_points > match.local_points

  return (
    <div className="app-layout">
      <Loader show={loading} label="Cargando..." />
      <PageWrapper loading={loading}/>
      <Header league={league}/>

      {match && league && (
        <main className="match-detail-container">
          <Link to={`/${league.slug}/results`} className="match-detail-back">
            ← Partidos
          </Link>

          <div className="match-detail-score-card">
            <div className="match-detail-tags">
              <span className={`match-detail-status-tag ${isPendiente ? 'pending' : 'finished'}`}>
                {isPendiente ? 'Pendiente' : 'Final'}
              </span>
              {match.type && match.type !== 'Regular' && (
                <span className="match-detail-stage-tag">{STAGE_LABELS[match.type]}</span>
              )}
            </div>

            <div className="match-detail-teams">
              <Link
                to={`/${league.slug}/equipos/${match.local_team.id}`}
                className={`match-detail-team left ${localGano ? 'winner' : ''}`}
              >
                <img src={match.local_team.logo_url} alt={match.local_team.name} className="match-detail-team-logo" />
                <span className="match-detail-team-name">{match.local_team.name}</span>
              </Link>

              <div className="match-detail-score">
                <span className={localGano ? 'winner' : ''}>{isPendiente ? '-' : match.local_points}</span>
                <span className="dash">-</span>
                <span className={visitanteGano ? 'winner' : ''}>{isPendiente ? '-' : match.visit_points}</span>
              </div>

              <Link
                to={`/${league.slug}/equipos/${match.visit_team.id}`}
                className={`match-detail-team right ${visitanteGano ? 'winner' : ''}`}
              >
                <span className="match-detail-team-name">{match.visit_team.name}</span>
                <img src={match.visit_team.logo_url} alt={match.visit_team.name} className="match-detail-team-logo" />
              </Link>
            </div>

            <div className="match-detail-meta">
              <span>Sede: {match.branch.name}</span>
              <span>·</span>
              <span>Campo: {match.field.name}</span>
              <span>·</span>
              <span>Fecha: {match.date}</span>
              <span>·</span>
              <span>Hora: {match.hour?.slice(0, 5)}</span>
            </div>
          </div>

          <section className="match-detail-boxscore">
            {[match.local_team, match.visit_team].map(team => {
              const sections = buildTeamBoxScore(stats, team.id)

              return (
                <div key={team.id} className="boxscore-team">
                  <h3 className="boxscore-team-title">
                    <img src={team.logo_url} alt={team.name} />
                    {team.name}
                  </h3>

                  {sections.length === 0 ? (
                    <p className="boxscore-empty">Sin estadísticas registradas</p>
                  ) : (
                    sections.map(section => (
                      <div key={section.key} className="boxscore-section">
                        <span className="boxscore-section-label">{section.label}</span>
                        <ul className="boxscore-list">
                          {section.players.map((p, i) => (
                            <li key={i}>
                              {p.name}
                              {p.value > 1 && <span className="boxscore-value"> ×{p.value}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              )
            })}
          </section>
        </main>
      )}

      <footer className="app-footer">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </footer>
    </div>
  )
}

export default MatchDetail
