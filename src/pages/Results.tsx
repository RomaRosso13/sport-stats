import { useEffect } from 'react'
import { useState } from "react"

import Header from "../components/common/Header"
import Footer from '../components/common/Footer'
import CategorySwitcher from "../components/filters/CategorySwitcher"
import ResultsDay from "../components/match/ResultDay"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'
import { getTeamsByCategoryId } from '../services/team.service'
import { getIndividualStatsByCategory } from '../services/individual_stats.service'
import { calculateMatchMVP } from '../utils/calculateMatchMVP'
import { STAT_KEYS } from '../constants/statFields'

import "./Results.css"

function Results() {
  const { league } = useLeague()
  const { categories, category, setCategory } = useCategory()
  const [matchdays, setMatchdays] = useState([])
  const [, setLoadingMatchdays] = useState(true)
  const [ teamData, setTeamData ] = useState([])
  const [mvpByMatch, setMvpByMatch] = useState({})

  useEffect(() => {
    if (!category) return

    async function loadMatchdays() {
      try {
        setLoadingMatchdays(true)

        const [teams, matchdaysData, individualStats] = await Promise.all([
          getTeamsByCategoryId(category.id),
          getMatchDaysByCategoryId(category.id),
          getIndividualStatsByCategory(category.id)
        ])
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

        const statsByMatch = {}
        individualStats.forEach(row => {
          const id = row.match_id
          if (!statsByMatch[id]) statsByMatch[id] = []
          statsByMatch[id].push(row)
        })

        const mvpMap = {}
        matches.forEach(match => {
          mvpMap[match.id] = calculateMatchMVP(statsByMatch[match.id] || [], STAT_KEYS)
        })

        setMatchdays(combined)
        setTeamData(teams)
        setMvpByMatch(mvpMap)

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
    }))
    .filter(j => j.games.length > 0)

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
      <main className="results-container">
        <CategorySwitcher categories={categories} active={category} onChange={setCategory}/>
        <h2 className="results-title">Resultados</h2>
        {matchdaysWithResults.length === 0 ? (
          <p className="empty-results">Aún no hay resultados</p>
        ) : (
          matchdaysWithResults.map(matchday => (
            <ResultsDay key={matchday.id} matchday={matchday} teams={teamData} mvpByMatch={mvpByMatch} />
          ))
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Results
