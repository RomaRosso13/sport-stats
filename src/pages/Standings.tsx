import { useEffect } from 'react'
import { useState } from "react"

import Header from "../components/Header"
import CategorySelector from "../components/CategorySelector"
import PositionTable from "../components/PositionTable"
import Loader from '../components/Loader'
import PageWrapper from '../components/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useSeason } from "../context/SeasonContext"
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'

import { calculateTable } from "../utils/calculateTable"

import "./Standings.css"

function Standings() {
    const { seasons, season, setSeason, loading } = useSeason()
    const { league, loading: leagueLoading } = useLeague()
    const { categories, category, setCategory, categoryLoading } = useCategory()
    const [matchdays, setMatchdays] = useState([])
    const [loadingMatchdays, setLoadingMatchdays] = useState(true)
  
    useEffect(() => {
      if (!category) return
  
      async function loadMatchdays() {
        try {
          setLoadingMatchdays(true)
  
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
  
          setMatchdays(combined)
  
        } catch (err) {
          console.error(err)
        } finally {
          setLoadingMatchdays(false)
        }
      }
  
      loadMatchdays()
    }, [category?.id])

    const matches = matchdays.flatMap(j => j.games)
    const calculatedTable = calculateTable(matches)

  const isDataLoading = !league || !matchdays.length
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
    <main className="standings-container">
      <CategorySelector categories={categories} active={category} onChange={setCategory}/>
      <h2 style={{ marginTop: '32px' }}>Tabla de Posiciones</h2>
      <PositionTable table={calculatedTable} />
    </main>
    <footer className="app-footer">
      © {new Date().getFullYear()} Liga · Todos los derechos reservados
    </footer>
  </div>
  )
}

export default Standings
