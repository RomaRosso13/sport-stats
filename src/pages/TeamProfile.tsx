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
import TeamLogo from '../components/common/TeamLogo'
import TeamGameLogChart from '../components/team/TeamGameLogChart'
import TeamOffenseDefenseChart from '../components/team/TeamOffenseDefenseChart'
import TeamLeagueComparison from '../components/team/TeamLeagueComparison'

import { useLeague } from '../context/LeagueContext'

import { getTeamById } from '../services/team.service'
import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'
import { getIndividualStatsByCategory } from '../services/individual_stats.service'
import { getCoachAssignmentsByLeagueId } from '../services/league_user.service.js'

import { calculateTeamStats } from '../utils/calculateTeamStats'
import { calculateTeamGameLog } from '../utils/calculateTeamGameLog'
import { sumTeamStats, calculateLeagueMaxes, OFFENSE_STAT_KEYS, DEFENSE_STAT_KEYS } from '../utils/calculateTeamOffenseDefense'
import { calculateLeagueAverage } from '../utils/calculateLeagueAverage'
import { classifyTopPlayersByStats } from '../utils/classifyTopPlayersByStats'
import { sortPlayersByNumber } from '../utils/sortPlayers'
import { getTeamColorStyle } from '../utils/teamColorStyle'
import { STAT_KEYS, getStatLabels } from '../constants/statFields'

import './TeamProfile.css'

function TeamProfile() {
  const { league } = useLeague()
  const { teamId } = useParams()
  const statLabels = getStatLabels(league)
  const STAT_SECTIONS = STAT_KEYS.map(key => ({ key, title: statLabels[key] }))

  const [team, setTeam] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [teamStats, setTeamStats] = useState(null)
  const [gameLog, setGameLog] = useState([])
  const [offenseDefense, setOffenseDefense] = useState({ totals: {}, leagueMaxes: {}, hasData: true })
  const [leagueAverage, setLeagueAverage] = useState(0)
  const [leaderboards, setLeaderboards] = useState({})
  const [loading, setLoading] = useState(true)
  const [coach, setCoach] = useState(null)

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
        setGameLog(calculateTeamGameLog(teamData.name, matchdaysWithGames))
        setLeagueAverage(calculateLeagueAverage(matches))

        const individualStats = await getIndividualStatsByCategory(teamData.category_id)
        const teamPlayerStats = individualStats.filter(
          row => String(row.team_id) === String(teamId)
        )
        setLeaderboards(
          classifyTopPlayersByStats(teamPlayerStats, STAT_KEYS, 3)
        )

        const offenseDefenseKeys = [...OFFENSE_STAT_KEYS, ...DEFENSE_STAT_KEYS]
        setOffenseDefense({
          totals: sumTeamStats(teamPlayerStats, offenseDefenseKeys),
          leagueMaxes: calculateLeagueMaxes(individualStats, offenseDefenseKeys),
          hasData: individualStats.length > 0
        })

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadTeamProfile()
  }, [teamId])

  useEffect(() => {
    if (!league?.id || !teamId) return

    async function loadCoach() {
      try {
        const assignments = await getCoachAssignmentsByLeagueId(league.id)
        const match = (assignments || []).find(a => String(a.team_id) === String(teamId))
        setCoach(match?.user || null)
      } catch (err) {
        console.error(err)
      }
    }

    loadCoach()
  }, [league?.id, teamId])

  const activePlayers = sortPlayersByNumber((team?.Player || []).filter(p => p.active))

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

          <div className="team-profile-header" style={getTeamColorStyle(team.primary_color)}>
            <TeamLogo logoUrl={team.logo_url} name={team.name} alt={team.name} className="team-profile-logo" />
            <div>
              {team.category?.type && (
                <span className="team-profile-category">{team.category.type}</span>
              )}
              <h2>{team.name}</h2>
              <span className="team-profile-coach-tag">
                Coach: {coach ? coach.name : 'Sin asignar'}
              </span>
            </div>
          </div>

          <div className="team-profile-layout">
            <div className="team-profile-main">
              <section className="profile-card">
                <h3 className="profile-card-title">Récord</h3>
                {teamStats && <TeamStats stats={teamStats} />}

                {teamStats && teamStats.partidos > 0 && (
                  <>
                    <div className="profile-section-divider" />
                    <TeamLeagueComparison
                      teamAvgFor={Number((teamStats.puntosFavor / teamStats.partidos).toFixed(1))}
                      teamAvgAgainst={Number((teamStats.puntosContra / teamStats.partidos).toFixed(1))}
                      leagueAverage={leagueAverage}
                    />
                  </>
                )}
              </section>

              <section className="profile-card">
                <h3 className="profile-card-title">Análisis de rendimiento</h3>
                <TeamGameLogChart games={gameLog} />
                <div className="profile-section-divider" />
                <TeamOffenseDefenseChart
                  totals={offenseDefense.totals}
                  leagueMaxes={offenseDefense.leagueMaxes}
                  statLabels={statLabels}
                  hasData={offenseDefense.hasData}
                />
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
