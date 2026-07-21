import { useState } from "react";
import { useEffect } from 'react'

import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import PositionTable from '../components/team/PositionTable'
import NextGameDay from '../components/calendar/NextGameDay'
import RecentResults from '../components/calendar/RecentResults'
import StatsTable from '../components/team/StatsTable'
import CategorySwitcher from "../components/filters/CategorySwitcher"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'
import LeagueNotFound from '../components/common/LeagueNotFound'

import { useSeason } from "../context/SeasonContext"
import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext';

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'
import { getIndividualStatsByCategory } from '../services/individual_stats.service'
import { getTeamsByCategoryId } from '../services/team.service'

import { calculateTable } from '../utils/calculateTable'
import { getNextGameDay } from '../utils/getNextGameDay'
import { getRecentResults } from '../utils/getRecentResults'
import { classifyTopPlayersByStats } from '../utils/classifyTopPlayersByStats'

import './Home.css'

function Home() {
  const { loading: seasonLoading } = useSeason()
  const { league, loading: leagueLoading } = useLeague()
  const { categories, category, setCategory } = useCategory()
  const [matchdays, setMatchdays] = useState([])
  const [teams, setTeams] = useState([])
  const [loadingMatchdays, setLoadingMatchdays] = useState(true)
  const [ stats, setStats ] = useState([])

  useEffect(() => {
    if (!category) {
      setTeams([])
      setMatchdays([])
      setStats([])
      setLoadingMatchdays(false)
      return
    }

    async function loadMatchdays() {
      try {
        setLoadingMatchdays(true)
        const teamsData = await getTeamsByCategoryId(category.id)
        const individualStats = await getIndividualStatsByCategory(category.id)
        const matchdaysData = await getMatchDaysByCategoryId(category.id)
        const ids = matchdaysData.map(md => md.id)
        const matches = await getMatchesByMatchDayIds(ids)

        const matchesMap = {}
        matches.forEach(match => {
          const id = match.matchday_id
          if (!matchesMap[id]) matchesMap[id] = []
          matchesMap[id].push(match)
        })

        const combined = matchdaysData.map(md => ({ ...md,
          games: matchesMap[md.id] || []
        }))

        setTeams(teamsData || [])
        setMatchdays(combined)
        setStats(individualStats)

      } catch (err) {
        console.error(err)
      } finally {
        setLoadingMatchdays(false)
      }
    }

    loadMatchdays()
  }, [category?.id])

  const matches = matchdays.flatMap(j => j.games)
  const calculatedTable = calculateTable(matches, teams)
  const nextGameDay = getNextGameDay(matchdays)
  const recentResults = getRecentResults(matchdays, 4)
  const leaderboard = classifyTopPlayersByStats( stats, ['touchdown', 'touchdown_pass', 'sacks', 'interceptions'])

  const isLoading = leagueLoading || seasonLoading || !league || loadingMatchdays

  if (!leagueLoading && !league) {
    return <LeagueNotFound/>
  }

return (
  <div className="app-layout">
    <Loader show={isLoading} label="Cargando..." />
    <PageWrapper loading={isLoading}/>
    <Header league={league}/>

    <main className="home-container">
      <CategorySwitcher
        categories={categories}
        active={category}
        onChange={setCategory}
      />

      <h2 className="stats-section-title">Líderes de la Temporada</h2>
      <div className="cards-row">
        <StatsTable title="Touchdowns" statKey="touchdown" data={leaderboard.touchdown} />
        <StatsTable title="Pases de Touchdown" statKey="touchdown_pass" data={leaderboard.touchdown_pass} />
        <StatsTable title="Intercepciones" statKey="interceptions" data={leaderboard.interceptions} />
        <StatsTable title="Sacks" statKey="sacks" data={leaderboard.sacks} />
      </div>

      <div className="home-layout">
        <div className="home-card positions-wrapper">
          <h2 className="card-title">Tabla de Posiciones</h2>
          <div className="card-body">
            <PositionTable table={calculatedTable} />
          </div>
        </div>

      <div className="right-column">
        <div className="home-card">
          <h2 className="card-title">Resultados Recientes</h2>
          <div className="card-body">
            <RecentResults games={recentResults} />
          </div>
        </div>

        <div className="home-card">
          <h2 className="card-title">Próximos partidos</h2>
          <div className="card-body">
            <NextGameDay data={nextGameDay} />
          </div>
        </div>
      </div>
      </div>
    </main>

    <Footer />
  </div>
)

}


export default Home
