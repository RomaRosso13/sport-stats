import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'

import Header from "../components/common/Header"
import Footer from '../components/common/Footer'
import CategorySwitcher from "../components/filters/CategorySwitcher"
import PositionTable from "../components/team/PositionTable"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'
import { useAuth } from '../context/AuthContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'
import { getTeamsByCategoryId } from '../services/team.service'

import { calculateTable } from "../utils/calculateTable"
import { isPlayoffStage, isScrimmage } from "../utils/matchStages"

import "./Standings.css"

function Standings() {
    const { league } = useLeague()
    const { categories, category, setCategory } = useCategory()
    const { user } = useAuth()
    const [matchdays, setMatchdays] = useState([])
    const [teams, setTeams] = useState([])
    const [, setLoadingMatchdays] = useState(true)

    useEffect(() => {
      if (!category) return

      async function loadMatchdays() {
        try {
          setLoadingMatchdays(true)

          const teamsData = await getTeamsByCategoryId(category.id)
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

        } catch (err) {
          console.error(err)
        } finally {
          setLoadingMatchdays(false)
        }
      }

      loadMatchdays()
    }, [category?.id])

    const regularSeasonMatchdays = matchdays.map(md => ({
      ...md,
      games: md.games.filter(m => !isPlayoffStage(m.type) && !isScrimmage(m.type))
    }))
    const matches = regularSeasonMatchdays.flatMap(j => j.games)
    const calculatedTable = calculateTable(matches, teams)

  const isDataLoading = !league || !matchdays.length
  const [showLoader, setShowLoader] = useState(true)
  const [exporting, setExporting] = useState(false)
  const tableRef = useRef(null)

  async function handleExportImage() {
    if (!tableRef.current) return

    try {
      setExporting(true)
      await new Promise(resolve => requestAnimationFrame(resolve))

      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: '#ffffff',
        useCORS: true,
        scale: 2
      })

      const link = document.createElement('a')
      const categoryLabel = category?.type ? `-${category.type}` : ''
      link.download = `tabla-posiciones${categoryLabel}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

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
    <main className="standings-container">
      <CategorySwitcher categories={categories} active={category} onChange={setCategory}/>
      <div className="standings-header">
        <h2 className="standings-title">Tabla de Posiciones</h2>
        {user && (
          <button
            className="export-image-btn"
            onClick={handleExportImage}
            disabled={exporting || isDataLoading}
          >
            {exporting ? 'Exportando...' : 'Exportar imagen'}
          </button>
        )}
      </div>
      <div ref={tableRef}>
        <PositionTable table={calculatedTable} matchdays={regularSeasonMatchdays} hideControls={exporting} />
      </div>
    </main>
    <Footer />
  </div>
  )
}

export default Standings
