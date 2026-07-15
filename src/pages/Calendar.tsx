import { useEffect } from 'react'
import { useState } from "react"

import Header from "../components/common/Header"
import CalendarDay from "../components/calendar/CalendarDay"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryIds } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'

import "./Calendar.css"

function Calendar() {
  const { league } = useLeague()
  const { categories } = useCategory()
  const [matchdays, setMatchdays] = useState([])
  const [loadingMatchdays, setLoadingMatchdays] = useState(true)

  useEffect(() => {
    if (!categories || categories.length === 0) return

    async function loadMatchdays() {
      try {
        setLoadingMatchdays(true)

        const categoryById = new Map()
        categories.forEach(cat => categoryById.set(cat.id, cat))

        const categoryIds = categories.map(cat => cat.id)
        const matchdaysData = await getMatchDaysByCategoryIds(categoryIds)
        const ids = matchdaysData.map(md => md.id)
        const matches = ids.length ? await getMatchesByMatchDayIds(ids) : []

        const matchesMap = new Map()
        matches.forEach(match => {
          if (!matchesMap.has(match.matchday_id)) {
            matchesMap.set(match.matchday_id, [])
          }
          matchesMap.get(match.matchday_id).push(match)
        })

        // Todas las categorías comparten un mismo calendario: se agrupan
        // las jornadas por fecha (cada categoría tiene su propia jornada,
        // pero si caen el mismo día se muestran juntas en una sola sección).
        const daysByDate = new Map()
        matchdaysData.forEach(md => {
          const category = categoryById.get(md.category_id)
          const games = (matchesMap.get(md.id) || []).map(game => ({ ...game, category }))

          if (!daysByDate.has(md.date)) {
            daysByDate.set(md.date, { id: md.date, date: md.date, names: new Set(), games: [] })
          }
          const day = daysByDate.get(md.date)
          day.names.add(md.name)
          day.games.push(...games)
        })

        const days = Array.from(daysByDate.values())
          .map(day => ({ ...day, name: [...day.names].join(' · ') }))
          .sort((a, b) => a.date.localeCompare(b.date))

        setMatchdays(days)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingMatchdays(false)
      }
    }

    loadMatchdays()
  }, [categories])

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
            Aún no hay jornadas programadas
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
