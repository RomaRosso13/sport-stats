import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Header from "../components/common/Header"
import CategorySelector from "../components/filters/CategorySelector"
import PlayoffBracket from "../components/match/PlayoffBracket"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'

import { PLAYOFF_STAGES } from '../utils/matchStages'

import "./Playoffs.css"

function Playoffs() {
  const { league } = useLeague()
  const { categories, category, setCategory } = useCategory()
  const [matches, setMatches] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)

  useEffect(() => {
    if (!category) return

    async function loadMatches() {
      try {
        setLoadingMatches(true)

        const matchdaysData = await getMatchDaysByCategoryId(category.id)
        const ids = matchdaysData.map(md => md.id)
        const matchesData = await getMatchesByMatchDayIds(ids)

        setMatches(matchesData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingMatches(false)
      }
    }

    loadMatches()
  }, [category?.id])

  const playoffMatches = matches.filter(m => PLAYOFF_STAGES.includes(m.type))

  const matchesByStage = {}
  PLAYOFF_STAGES.forEach(stage => {
    matchesByStage[stage] = playoffMatches
      .filter(m => m.type === stage)
      .sort((a, b) => `${a.date} ${a.hour}`.localeCompare(`${b.date} ${b.hour}`))
  })

  const finalMatch = matchesByStage['Final']?.[0]
  const champion = finalMatch && finalMatch.status === 'Terminado'
    ? (finalMatch.local_points > finalMatch.visit_points ? finalMatch.local_team : finalMatch.visit_team)
    : null

  const isDataLoading = !league || loadingMatches
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
      <main className="playoffs-container">
        <CategorySelector categories={categories} active={category} onChange={setCategory}/>
        <h2 className="playoffs-title">Playoffs</h2>

        {champion && (
          <Link to={`/${league.slug}/equipos/${champion.id}`} className="champion-banner">
            <span className="champion-trophy">🏆</span>
            {champion.logo_url && (
              <img src={champion.logo_url} alt={champion.name} className="champion-logo" />
            )}
            <div className="champion-text">
              <span className="champion-label">Campeón</span>
              <span className="champion-name">{champion.name}</span>
            </div>
          </Link>
        )}

        {playoffMatches.length === 0 ? (
          <p className="empty-playoffs">Aún no hay partidos de playoffs registrados</p>
        ) : (
          <PlayoffBracket matchesByStage={matchesByStage} />
        )}
      </main>
      <footer className="app-footer">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </footer>
    </div>
  )
}

export default Playoffs
