import { useEffect, useMemo, useState } from 'react'

import Header from "../components/common/Header"
import Footer from '../components/common/Footer'
import CategorySwitcher from "../components/filters/CategorySwitcher"
import DivisionFilter from "../components/filters/DivisionFilter"
import PlayerStatsTable from "../components/team/PlayerStatsTable"
import CompletePlayersCard from "../components/team/CompletePlayersCard"
import LeagueChampionsCard from "../components/team/LeagueChampionsCard"
import PlayerStatsExportPanel from "../components/team/PlayerStatsExportPanel"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'
import { useSeason } from '../context/SeasonContext'
import { useAuth } from '../context/AuthContext'

import { getIndividualStatsByCategory, getIndividualStatsByCategoryIds } from '../services/individual_stats.service'
import { getTeamsByCategoryId } from '../services/team.service'
import { getActiveDivisionsByCategoryId, getActiveDivisionsByCategoryIds } from '../services/division.service'
import { classifyTopPlayersByStats } from '../utils/classifyTopPlayersByStats'
import { getMostCompletePlayers } from '../utils/getMostCompletePlayers'
import { filterStatsByDivision, filterTeamsByDivision } from '../utils/divisionFilter'
import { STAT_KEYS, getStatLabels } from '../constants/statFields'

import "./PlayerStats.css"

function PlayerStats() {
  const { league } = useLeague()
  const { categories, category, setCategory } = useCategory()
  const { season } = useSeason()
  const { user } = useAuth()
  const [stats, setStats] = useState([])
  const [teams, setTeams] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [activeStat, setActiveStat] = useState(STAT_KEYS[0])
  const [teamFilter, setTeamFilter] = useState('all')
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [divisions, setDivisions] = useState([])
  const [activeDivisionId, setActiveDivisionId] = useState(null)
  const [leagueStats, setLeagueStats] = useState([])
  const [leagueDivisions, setLeagueDivisions] = useState([])
  const statLabels = getStatLabels(league)
  const STAT_SECTIONS = STAT_KEYS.map(key => ({ key, title: statLabels[key], label: statLabels[key] }))

  useEffect(() => {
    if (!category) return

    async function loadStats() {
      try {
        setLoadingStats(true)
        const [statsData, teamsData] = await Promise.all([
          getIndividualStatsByCategory(category.id),
          getTeamsByCategoryId(category.id)
        ])
        setStats(statsData || [])
        setTeams(teamsData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingStats(false)
      }
    }

    loadStats()
  }, [category?.id])

  useEffect(() => {
    setActiveStat(STAT_KEYS[0])
    setTeamFilter('all')
    setActiveDivisionId(null)
  }, [category?.id])

  useEffect(() => {
    if (!category) {
      setDivisions([])
      return
    }

    async function loadDivisions() {
      try {
        const data = await getActiveDivisionsByCategoryId(category.id)
        setDivisions(data || [])
      } catch (err) {
        console.error(err)
      }
    }

    loadDivisions()
  }, [category?.id])

  const categoryIdsKey = (categories || []).map(c => c.id).join(',')

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setLeagueStats([])
      setLeagueDivisions([])
      return
    }

    async function loadLeagueStats() {
      try {
        const categoryIds = categories.map(c => c.id)
        const [statsData, divisionsData] = await Promise.all([
          getIndividualStatsByCategoryIds(categoryIds),
          getActiveDivisionsByCategoryIds(categoryIds)
        ])
        setLeagueStats(statsData || [])
        setLeagueDivisions(divisionsData || [])
      } catch (err) {
        console.error(err)
      }
    }

    loadLeagueStats()
  }, [categoryIdsKey])

  const categoryById = useMemo(
    () => Object.fromEntries((categories || []).map(c => [c.id, c])),
    [categoryIdsKey]
  )
  const divisionById = useMemo(
    () => Object.fromEntries(leagueDivisions.map(d => [d.id, d])),
    [leagueDivisions]
  )

  // Cada fila se etiqueta con "Tipo [División]" para que el ranking general
  // de la liga muestre de qué categoría/división es cada jugador líder.
  const taggedLeagueStats = useMemo(() => leagueStats.map(row => {
    const cat = categoryById[row.category_id]
    const division = row.team?.division_id ? divisionById[row.team.division_id] : null
    const categoryLabel = [cat?.type, division?.name].filter(Boolean).join(' ')
    return { ...row, categoryLabel: categoryLabel || null }
  }), [leagueStats, categoryById, divisionById])

  const leagueLeaderboards = useMemo(
    () => classifyTopPlayersByStats(taggedLeagueStats, STAT_KEYS, 3),
    [taggedLeagueStats]
  )

  const divisionStats = useMemo(
    () => filterStatsByDivision(stats, activeDivisionId),
    [stats, activeDivisionId]
  )
  const divisionTeams = useMemo(
    () => filterTeamsByDivision(teams, activeDivisionId),
    [teams, activeDivisionId]
  )

  const leaderboards = useMemo(
    () => classifyTopPlayersByStats(divisionStats, STAT_KEYS, Infinity),
    [divisionStats]
  )
  const mostCompletePlayers = useMemo(
    () => getMostCompletePlayers(leaderboards, STAT_KEYS),
    [leaderboards]
  )
  const completePlayersForExport = useMemo(
    () => getMostCompletePlayers(leaderboards, STAT_KEYS, { limit: 10 }),
    [leaderboards]
  )

  const activeData = teamFilter === 'all'
    ? leaderboards[activeStat]
    : (leaderboards[activeStat] || []).filter(player => String(player.teamId) === teamFilter)
  const activeSection = STAT_SECTIONS.find(section => section.key === activeStat) || STAT_SECTIONS[0]

  const isDataLoading = !league || loadingStats
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (!isDataLoading) {
      setShowLoader(false)
      return
    }

    setShowLoader(true)

    const timeout = setTimeout(() => {
      setShowLoader(false)
    }, 4000)

    return () => clearTimeout(timeout)
  }, [isDataLoading])

  return (
    <div className="app-layout">
      <Loader show={showLoader} label="Cargando..." />
      <PageWrapper loading={showLoader}/>
      <Header league={league}/>
      <main className="player-stats-container">
        <CategorySwitcher categories={categories} active={category} onChange={setCategory}/>
        <DivisionFilter divisions={divisions} activeDivisionId={activeDivisionId} onChange={id => { setActiveDivisionId(id); setTeamFilter('all') }}/>
        <div className="player-stats-header">
          <h2 className="player-stats-title">Estadísticas Individuales</h2>
          {user && (
            <button
              className="export-image-btn"
              onClick={() => setShowExportPanel(true)}
              disabled={isDataLoading}
            >
              Exportar imagen
            </button>
          )}
        </div>

        <CompletePlayersCard players={mostCompletePlayers} statLabels={statLabels} />

        {categories.length > 1 && (
          <>
            <h2 className="stats-section-title">Campeón de Liga</h2>
            <div className="cards-row">
              {STAT_SECTIONS.map(section => (
                <LeagueChampionsCard
                  key={section.key}
                  title={section.title}
                  statKey={section.key}
                  data={leagueLeaderboards[section.key]}
                />
              ))}
            </div>
          </>
        )}

        <div className="player-stats-controls">
          <div className="stat-tabs">
            {STAT_SECTIONS.map(section => (
              <button
                key={section.key}
                type="button"
                className={`stat-tab ${activeStat === section.key ? 'active' : ''}`}
                onClick={() => setActiveStat(section.key)}
              >
                {section.title}
              </button>
            ))}
          </div>

          {divisionTeams.length > 0 && (
            <select
              className="team-filter-select"
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
            >
              <option value="all">Todos los equipos</option>
              {divisionTeams.map(team => (
                <option key={team.id} value={String(team.id)}>{team.name}</option>
              ))}
            </select>
          )}
        </div>

        <PlayerStatsTable
          key={activeSection.key}
          title={activeSection.title}
          statKey={activeSection.key}
          statLabel={activeSection.label}
          data={activeData}
        />
      </main>
      <Footer />

      {showExportPanel && (
        <PlayerStatsExportPanel
          onClose={() => setShowExportPanel(false)}
          league={league}
          category={category}
          season={season}
          leaderboards={leaderboards}
          statSections={STAT_SECTIONS}
          completePlayers={completePlayersForExport}
          statKey={activeSection.key}
        />
      )}
    </div>
  )
}

export default PlayerStats
