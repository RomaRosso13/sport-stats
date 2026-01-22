import { useEffect } from 'react'
import { useState } from "react"

import Header from "../components/Header"
import CategorySelector from "../components/CategorySelector"
import ResultsDay from "../components/ResultDay"

import { useLeague } from '../context/LeagueContext'
import { useSeason } from "../context/SeasonContext"
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'

import "./Results.css"

function Results() {
  const { league, loading: leagueLoading } = useLeague()
  const { seasons, season, setSeason, loading } = useSeason()
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

  const matchdaysWithResults = matchdays
    .map(j => ({
      ...j,
      games: j.games.filter(p => p.status == 'Terminado')
    }))
    .filter(j => j.games.length > 0)

    console.log('MatchDaysWithResults', matchdaysWithResults)

  return (
    <div className="app-layout">
      <Header league={league}/>
      <main className="results-container">
        <CategorySelector categories={categories} active={category} onChange={setCategory}/>
        {matchdaysWithResults.length === 0 ? (
          <p className="empty-results">Aún no hay resultados</p>
        ) : (
          matchdaysWithResults.map(matchday => (
            <ResultsDay key={matchday.id} matchday={matchday} />
          ))
        )}
      </main>
      <footer className="app-footer">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </footer>
    </div>
  )
}

export default Results
