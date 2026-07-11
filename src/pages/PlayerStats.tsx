import { useEffect, useState } from 'react'

import Header from "../components/common/Header"
import CategorySelector from "../components/filters/CategorySelector"
import PlayerStatsTable from "../components/team/PlayerStatsTable"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'

import { getIndividualStatsByCategory } from '../services/individual_stats.service'
import { classifyTopPlayersByStats } from '../utils/classifyTopPlayersByStats'

import "./PlayerStats.css"

const STAT_SECTIONS = [
  { key: 'touchdown', title: 'Touchdowns', label: 'TD' },
  { key: 'touchdown_pass', title: 'Pases de Touchdown', label: 'PTD' },
  { key: 'interceptions', title: 'Intercepciones', label: 'INT' },
  { key: 'sacks', title: 'Sacks', label: 'SK' }
]

const STAT_KEYS = STAT_SECTIONS.map(s => s.key)

function PlayerStats() {
  const { league } = useLeague()
  const { categories, category, setCategory } = useCategory()
  const [stats, setStats] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!category) return

    async function loadStats() {
      try {
        setLoadingStats(true)
        const statsData = await getIndividualStatsByCategory(category.id)
        setStats(statsData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingStats(false)
      }
    }

    loadStats()
  }, [category?.id])

  const leaderboards = classifyTopPlayersByStats(stats, STAT_KEYS, Infinity)

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
        <CategorySelector categories={categories} active={category} onChange={setCategory}/>
        <h2 className="player-stats-title">Estadísticas Individuales</h2>

        {STAT_SECTIONS.map(section => (
          <PlayerStatsTable
            key={section.key}
            title={section.title}
            statKey={section.key}
            statLabel={section.label}
            data={leaderboards[section.key]}
          />
        ))}
      </main>
      <footer className="app-footer">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </footer>
    </div>
  )
}

export default PlayerStats
