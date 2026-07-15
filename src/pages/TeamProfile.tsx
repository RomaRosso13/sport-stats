import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'
import TeamStats from '../components/team/TeamStats'
import PlayerRow from '../components/player/PlayerRow'
import StatsTable from '../components/team/StatsTable'
import TeamScheduleRow from '../components/team/TeamScheduleRow'

import { useLeague } from '../context/LeagueContext'

import { getTeamById } from '../services/team.service'
import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'
import { getIndividualStatsByCategory } from '../services/individual_stats.service'

import { calculateTeamStats } from '../utils/calculateTeamStats'
import { classifyTopPlayersByStats } from '../utils/classifyTopPlayersByStats'

import './TeamProfile.css'

const STAT_SECTIONS = [
  { key: 'touchdown', title: 'Touchdowns' },
  { key: 'touchdown_pass', title: 'Pases de TD' },
  { key: 'interceptions', title: 'Intercepciones' },
  { key: 'sacks', title: 'Sacks' }
]

function TeamProfile() {
  const { league } = useLeague()
  const { teamId } = useParams()

  const [team, setTeam] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [teamStats, setTeamStats] = useState(null)
  const [leaderboards, setLeaderboards] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teamId) return

    async function loadTeamProfile() {
      try {
        setLoading(true)

        const teamData = await getTeamById(teamId)
        setTeam(teamData)

        const matchdaysData = await getMatchDaysByCategoryId(teamData.category_id)
        const ids = matchdaysData.map(md => md.id)
        const matches = await getMatchesByMatchDayIds(ids)

        const matchdayById = {}
        matchdaysData.forEach(md => { matchdayById[md.id] = md })

        const teamMatches = matches
          .filter(m =>
            String(m.local_team_id) === String(teamId) ||
            String(m.visit_team_id) === String(teamId)
          )
          .map(m => ({
            ...m,
            matchday_name: matchdayById[m.matchday_id]?.name
          }))
          .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

        setSchedule(teamMatches)

        const matchdaysWithGames = matchdaysData.map(md => ({
          ...md,
          games: matches.filter(m => m.matchday_id === md.id)
        }))
        setTeamStats(calculateTeamStats(teamData.name, matchdaysWithGames))

        const individualStats = await getIndividualStatsByCategory(teamData.category_id)
        const teamPlayerStats = individualStats.filter(
          row => String(row.team_id) === String(teamId)
        )
        setLeaderboards(
          classifyTopPlayersByStats(teamPlayerStats, STAT_SECTIONS.map(s => s.key), 3)
        )

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadTeamProfile()
  }, [teamId])

  const activePlayers = (team?.Player || []).filter(p => p.active)

  return (
    <div className="app-layout">
      <Loader show={loading} label="Cargando..." />
      <PageWrapper loading={loading}/>
      <Header league={league}/>

      {team && (
        <main className="team-profile-container">
          <Link to={`/${league.slug}/equipos`} className="team-profile-back">
            ← Equipos
          </Link>

          <div className="team-profile-header">
            <img src={team.logo_url} alt={team.name} className="team-profile-logo" />
            <div>
              {team.category?.type && (
                <span className="team-profile-category">{team.category.type}</span>
              )}
              <h2>{team.name}</h2>
            </div>
          </div>

          <div className="team-profile-layout">
            <div className="team-profile-main">
              <section className="profile-card">
                <h3 className="profile-card-title">Récord</h3>
                {teamStats && <TeamStats stats={teamStats} />}
              </section>

              <section className="profile-card">
                <h3 className="profile-card-title">Calendario</h3>
                {schedule.length === 0 ? (
                  <p className="profile-empty">Aún no hay partidos programados</p>
                ) : (
                  <div className="team-schedule-list">
                    {schedule.map(match => (
                      <TeamScheduleRow key={match.id} match={match} teamId={team.id} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="team-profile-side">
              <section className="profile-card">
                <h3 className="profile-card-title">Líderes del equipo</h3>
                <div className="team-leaders-list">
                  {STAT_SECTIONS.map(section => (
                    <StatsTable
                      key={section.key}
                      title={section.title}
                      statKey={section.key}
                      data={leaderboards[section.key]}
                    />
                  ))}
                </div>
              </section>

              <section className="profile-card">
                <h3 className="profile-card-title">Roster ({activePlayers.length})</h3>
                {activePlayers.length === 0 ? (
                  <p className="profile-empty">Sin jugadores registrados</p>
                ) : (
                  <div className="team-roster-list">
                    {activePlayers.map(player => (
                      <PlayerRow key={player.id} player={player} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      )}

      <Footer />
    </div>
  )
}

export default TeamProfile
