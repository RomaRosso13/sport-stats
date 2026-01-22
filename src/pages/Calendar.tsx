import { useEffect } from 'react'
import { useState } from "react"

import Header from "../components/Header"
import CategorySelector from "../components/CategorySelector"
import CalendarDay from "../components/CalendarDay"

import { useLeague } from '../context/LeagueContext'
import { useSeason } from "../context/SeasonContext"
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'

import "./Calendar.css"

function Calendar() {
  const { league } = useLeague()
  const { seasons, season } = useSeason()
  const { categories, category, setCategory } = useCategory()
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

  return (
    <div className="app-layout">
      <Header league={league} seasons={seasons} season={season} />

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
