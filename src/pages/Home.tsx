import { useState } from "react";
import { useEffect } from 'react'

import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import PositionTable from '../components/team/PositionTable'
import NextGameDay from '../components/calendar/NextGameDay'
import RecentResults from '../components/calendar/RecentResults'
import StatsTable from '../components/team/StatsTable'
import CategorySwitcher from "../components/filters/CategorySwitcher"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'
import LeagueNotFound from '../components/common/LeagueNotFound'
import HeroSlider from '../components/home/HeroSlider'
import PlayoffBracket from '../components/match/PlayoffBracket'

import { useSeason } from "../context/SeasonContext"
import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext';

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'
import { getIndividualStatsByCategory } from '../services/individual_stats.service'
import { getTeamsByCategoryId } from '../services/team.service'
import { getHeroImagesByLeagueId } from '../services/league_hero_image.service'

import { calculateTable } from '../utils/calculateTable'
import { isScrimmage, PLAYOFF_STAGES } from '../utils/matchStages'
import { getNextGameDay } from '../utils/getNextGameDay'
import { getRecentResults } from '../utils/getRecentResults'
import { classifyTopPlayersByStats } from '../utils/classifyTopPlayersByStats'
import { STAT_KEYS, getStatLabels } from '../constants/statFields'
import { HOME_MODULE_SIZES } from '../constants/homeModules'

import './Home.css'

// Acomoda una lista ORDENADA de keys de módulos activos en "filas": una
// 'full' se queda sola en su franja; una 'main' recoge hasta 2 'side' que
// vengan justo después de ella en el orden para acompañarla; una 'side'
// suelta (sin una 'main' justo antes) cae en su propia fila. Mismo motor
// que ya se mostró y se aprobó en la previsualización.
function buildHomeRows(keys) {
  const rows = []
  let i = 0

  while (i < keys.length) {
    const key = keys[i]
    const size = HOME_MODULE_SIZES[key]

    if (size === 'main') {
      const side = []
      let j = i + 1
      while (j < keys.length && HOME_MODULE_SIZES[keys[j]] === 'side' && side.length < 2) {
        side.push(keys[j])
        j++
      }
      rows.push({ type: 'split', main: key, side })
      i = j
    } else {
      rows.push({ type: 'full', key })
      i++
    }
  }

  return rows
}

function Home() {
  const { loading: seasonLoading } = useSeason()
  const { league, loading: leagueLoading } = useLeague()
  const { categories, category, setCategory } = useCategory()
  const [matchdays, setMatchdays] = useState([])
  const [teams, setTeams] = useState([])
  const [loadingMatchdays, setLoadingMatchdays] = useState(true)
  const [ stats, setStats ] = useState([])
  const [heroImages, setHeroImages] = useState([])

  useEffect(() => {
    if (!league?.id) {
      setHeroImages([])
      return
    }

    let isMounted = true

    async function loadHeroImages() {
      try {
        const images = await getHeroImagesByLeagueId(league.id)
        if (isMounted) setHeroImages(images || [])
      } catch (err) {
        console.error(err)
      }
    }

    loadHeroImages()

    return () => {
      isMounted = false
    }
  }, [league?.id])

  useEffect(() => {
    if (!category) {
      setTeams([])
      setMatchdays([])
      setStats([])
      setLoadingMatchdays(false)
      return
    }

    async function loadMatchdays() {
      try {
        setLoadingMatchdays(true)
        const teamsData = await getTeamsByCategoryId(category.id)
        const individualStats = await getIndividualStatsByCategory(category.id)
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
        setStats(individualStats)

      } catch (err) {
        console.error(err)
      } finally {
        setLoadingMatchdays(false)
      }
    }

    loadMatchdays()
  }, [category?.id])

  const matches = matchdays.flatMap(j => j.games).filter(m => !isScrimmage(m.type))
  // Se calcula con TODOS los equipos/partidos (para que el récord del rival
  // de un equipo desactivado siga siendo correcto), y solo después se
  // esconde la fila del equipo desactivado.
  const activeTeamIds = new Set(teams.filter(t => t.active !== false).map(t => t.id))
  const calculatedTable = calculateTable(matches, teams, league?.tiebreaker_config).filter(row => activeTeamIds.has(row.id))
  const nextGameDay = getNextGameDay(matchdays)
  const recentResults = getRecentResults(matchdays, 4)
  const leaderboard = classifyTopPlayersByStats(stats, STAT_KEYS)
  const statLabels = getStatLabels(league)

  // Mismo cálculo que Playoffs.tsx, para el módulo "Cuadro de Eliminación".
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

  const isLoading = leagueLoading || seasonLoading || !league || loadingMatchdays

  if (!leagueLoading && !league) {
    return <LeagueNotFound/>
  }

  // Un módulo por key — cada uno trae su propio "home-card" ya armado.
  function renderHomeModule(key) {
    switch (key) {
      case 'stats':
        return (
          <>
            <h2 className="stats-section-title">Líderes de la Temporada</h2>
            <div className="cards-row">
              <StatsTable title={statLabels.touchdown} statKey="touchdown" data={leaderboard.touchdown} />
              <StatsTable title={statLabels.touchdown_pass} statKey="touchdown_pass" data={leaderboard.touchdown_pass} />
              <StatsTable title={statLabels.interceptions} statKey="interceptions" data={leaderboard.interceptions} />
              <StatsTable title={statLabels.sacks} statKey="sacks" data={leaderboard.sacks} />
            </div>
          </>
        )
      case 'standings':
        return (
          <div className="home-card positions-wrapper">
            <h2 className="card-title">Tabla de Posiciones</h2>
            <div className="card-body">
              <PositionTable table={calculatedTable} matchdays={matchdays} />
            </div>
          </div>
        )
      case 'bracket':
        return (
          <div className="home-card">
            <h2 className="card-title">Cuadro de Eliminación</h2>
            <div className="card-body">
              {playoffMatches.length === 0 ? (
                <p className="empty-bracket">Aún no hay partidos de playoffs registrados</p>
              ) : (
                <PlayoffBracket matchesByStage={matchesByStage} championId={champion?.id} />
              )}
            </div>
          </div>
        )
      case 'banner':
        if (heroImages.length === 0) return null
        return (
          <div className="home-card">
            <div className="card-body">
              <HeroSlider images={heroImages} />
            </div>
          </div>
        )
      case 'results':
        return (
          <div className="home-card">
            <h2 className="card-title">Resultados Recientes</h2>
            <div className="card-body">
              <RecentResults games={recentResults} />
            </div>
          </div>
        )
      case 'upcoming':
        return (
          <div className="home-card">
            <h2 className="card-title">Próximos partidos</h2>
            <div className="card-body">
              <NextGameDay data={nextGameDay} standings={calculatedTable} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Mientras una liga no guarde nada en Configuración General, su Inicio
  // sigue exactamente igual que siempre (sin pasar por el motor de filas de
  // abajo) — así ninguna liga existente ve un cambio sin haberlo pedido.
  const hasCustomModules = Array.isArray(league?.home_modules_config) && league.home_modules_config.length > 0

  const enabledModuleKeys = hasCustomModules
    ? league.home_modules_config
        .filter(m => m.enabled)
        .map(m => m.key)
        .filter(key => key !== 'banner' || heroImages.length > 0)
    : []

  const homeRows = hasCustomModules ? buildHomeRows(enabledModuleKeys) : []

return (
  <div className="app-layout">
    <Loader show={isLoading} label="Cargando..." />
    <PageWrapper loading={isLoading}/>
    <Header league={league}/>

    <main className={`home-container ${hasCustomModules ? 'home-container--flow' : ''}`}>
      <CategorySwitcher
        categories={categories}
        active={category}
        onChange={setCategory}
      />

      {hasCustomModules ? (
        <div className="home-rows">
          {homeRows.map((row, index) => {
            if (row.type === 'full') {
              return (
                <div key={index} className="home-row-full">
                  {renderHomeModule(row.key)}
                </div>
              )
            }

            // Un módulo principal sin compañía lateral no debe quedarse a
            // medio ancho (lo que pasaría si se metiera en el grid de 2
            // columnas de .home-row-split con la segunda columna vacía) —
            // se renderiza como una fila completa, igual que uno 'full'.
            if (row.side.length === 0) {
              return (
                <div key={index} className="home-row-full home-row-main-alone">
                  {renderHomeModule(row.main)}
                </div>
              )
            }

            return (
              <div key={index} className="home-row-split">
                <div className="main-slot">{renderHomeModule(row.main)}</div>
                <div className="home-row-side-stack">
                  {row.side.map(key => <div key={key}>{renderHomeModule(key)}</div>)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <>
          <h2 className="stats-section-title">Líderes de la Temporada</h2>
          <div className="cards-row">
            <StatsTable title={statLabels.touchdown} statKey="touchdown" data={leaderboard.touchdown} />
            <StatsTable title={statLabels.touchdown_pass} statKey="touchdown_pass" data={leaderboard.touchdown_pass} />
            <StatsTable title={statLabels.interceptions} statKey="interceptions" data={leaderboard.interceptions} />
            <StatsTable title={statLabels.sacks} statKey="sacks" data={leaderboard.sacks} />
          </div>

          <div className="home-layout">
            <div className="home-card positions-wrapper">
              <h2 className="card-title">Tabla de Posiciones</h2>
              <div className="card-body">
                <PositionTable table={calculatedTable} matchdays={matchdays} />
              </div>
            </div>

            <div className="right-column">
              {heroImages.length > 0 ? (
                <div className="home-card">
                  <div className="card-body">
                    <HeroSlider images={heroImages} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="home-card">
                    <h2 className="card-title">Resultados Recientes</h2>
                    <div className="card-body">
                      <RecentResults games={recentResults} />
                    </div>
                  </div>

                  <div className="home-card">
                    <h2 className="card-title">Próximos partidos</h2>
                    <div className="card-body">
                      <NextGameDay data={nextGameDay} standings={calculatedTable} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </main>

    <Footer />
  </div>
)

}


export default Home
