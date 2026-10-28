import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Header from "../components/common/Header"
import Footer from '../components/common/Footer'
import CategorySwitcher from "../components/filters/CategorySwitcher"
import PlayoffBracket from "../components/match/PlayoffBracket"
import TeamLogo from "../components/common/TeamLogo"
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
  const [matchdays, setMatchdays] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)

  useEffect(() => {
    if (!category) return

    async function loadMatches() {
      try {
        setLoadingMatches(true)

        const matchdaysData = await getMatchDaysByCategoryId(category.id)
        const ids = matchdaysData.map(md => md.id)
        const matchesData = ids.length ? await getMatchesByMatchDayIds(ids) : []

        setMatchdays(matchdaysData || [])
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

  // Cada bracket de playoffs (puede haber varios independientes, uno por
  // división, o uno solo general) vive en su propia jornada — se agrupan
  // por matchday_id para poder mostrarlos como brackets separados, igual
  // que en el Asistente del Torneo.
  const playoffMatchdayIds = [...new Set(playoffMatches.map(m => m.matchday_id))].sort((a, b) => {
    const dateA = matchdays.find(md => md.id === a)?.date || ''
    const dateB = matchdays.find(md => md.id === b)?.date || ''
    return dateA.localeCompare(dateB)
  })

  const playoffBrackets = playoffMatchdayIds.map(matchdayId => {
    const mdMatches = playoffMatches.filter(m => m.matchday_id === matchdayId)
    const matchesByStage = {}
    PLAYOFF_STAGES.forEach(stage => {
      matchesByStage[stage] = mdMatches
        .filter(m => m.type === stage)
        .sort((a, b) => `${a.date} ${a.hour}`.localeCompare(`${b.date} ${b.hour}`))
    })
    const finalMatch = matchesByStage['Final']?.[0]
    const champion = finalMatch && finalMatch.status === 'Terminado'
      ? (finalMatch.local_points > finalMatch.visit_points ? finalMatch.local_team : finalMatch.visit_team)
      : null
    const matchday = matchdays.find(md => md.id === matchdayId)
    return { matchdayId, label: matchday?.name || 'Playoffs', matchesByStage, champion }
  })

  // La mayoría de las ligas solo usa un bracket general — en ese caso se
  // mantiene la vista de siempre (sin encabezado extra). Solo cuando hay
  // más de uno (playoffs por división) se muestran como bloques separados.
  const showBracketLabels = playoffBrackets.length > 1
  const champion = playoffBrackets.length === 1 ? playoffBrackets[0].champion : null

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
        <CategorySwitcher categories={categories} active={category} onChange={setCategory}/>
        <h2 className="playoffs-title">Playoffs</h2>

        {champion && (
          <Link to={`/${league.slug}/equipos/${champion.id}`} className="champion-banner">
            <span className="champion-trophy">🏆</span>
            <TeamLogo logoUrl={champion.logo_url} name={champion.name} alt={champion.name} className="champion-logo" />
            <div className="champion-text">
              <span className="champion-label">Campeón</span>
              <span className="champion-name">{champion.name}</span>
            </div>
          </Link>
        )}

        {playoffMatches.length === 0 ? (
          <p className="empty-playoffs">Aún no hay partidos de playoffs registrados</p>
        ) : (
          playoffBrackets.map(b => (
            <div key={b.matchdayId} className="playoff-bracket-block">
              {showBracketLabels && (
                <>
                  <h3 className="playoff-bracket-block-title">🏆 {b.label}</h3>
                  {b.champion && (
                    <p className="playoff-bracket-block-champion">Campeón: {b.champion.name}</p>
                  )}
                </>
              )}
              <PlayoffBracket matchesByStage={b.matchesByStage} championId={b.champion?.id} />
            </div>
          ))
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Playoffs
