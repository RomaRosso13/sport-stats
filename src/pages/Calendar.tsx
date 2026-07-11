import { useEffect } from 'react'
import { useState } from "react"

import Header from "../components/common/Header"
import CategorySelector from "../components/filters/CategorySelector"
import CalendarDay from "../components/calendar/CalendarDay"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'

import "./Calendar.css"

function Calendar() {
  const { league } = useLeague()
  const { categories, category, setCategory } = useCategory()
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
          if (!matchesMap[match.matchday_id]) {
            matchesMap[match.matchday_id] = []
          }
          matchesMap[match.matchday_id].push(match)
        })

        setMatchdays(
          matchdaysData.map(md => ({
            ...md,
            games: matchesMap[md.id] || []
          }))
        )
      } finally {
        setLoadingMatchdays(false)
      }
    }

    loadMatchdays()
  }, [category?.id])

  const isDataLoading = !league || loadingMatchdays
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

      <main className="calendar-container">
        <CategorySelector
          categories={categories}
          active={category}
          onChange={setCategory}
        />

        {matchdays.length > 1 && (
          <nav className="jornada-nav">
            {matchdays.map(md => (
              <a key={md.id} href={`#jornada-${md.id}`} className="jornada-pill">
                {md.name}
              </a>
            ))}
          </nav>
        )}

        {!loadingMatchdays && matchdays.length === 0 ? (
          <p className="empty-state">
            Esta categoría aún no tiene jornadas programadas
          </p>
        ) : (
          <div className="jornada-list">
            {matchdays.map(md => (
              <CalendarDay key={md.id} matchday={md} />
            ))}
          </div>
        )}
      </main>

      <footer className="app-footer">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </footer>
    </div>
  )
}


export default Calendar
