import { useEffect } from 'react'
import { useState } from "react"

import Header from "../components/Header"
import CategorySelector from "../components/CategorySelector"
import CalendarDay from "../components/CalendarDay"
import Loader from '../components/Loader'
import PageWrapper from '../components/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'

import "./Calendar.css"

function Calendar() {
  const { league } = useLeague()
  const { categories, category, setCategory, categoryLoading } = useCategory()
  const [matchdays, setMatchdays] = useState([])

  useEffect(() => {
    if (!category) return

    async function loadMatchdays() {
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
    }

    loadMatchdays()
  }, [category?.id])

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

      <main className="calendar-container">
        <CategorySelector
          categories={categories}
          active={category}
          onChange={setCategory}
        />

        {matchdays.map(md => (
          <CalendarDay key={md.id} matchday={md} />
        ))}
      </main>

      <footer className="app-footer">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </footer>
    </div>
  )
}


export default Calendar
