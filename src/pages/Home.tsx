import { useState } from "react";
import { useEffect } from 'react'

import Header from '../components/Header'
import PositionTable from '../components/PositionTable'
import NextGameDay from '../components/NextGameDay'
import RecentResults from '../components/RecentResults'
import StatsTable from '../components/StatsTable'
import CategorySelector from "../components/CategorySelector"
import Loader from '../components/Loader'
import PageWrapper from '../components/PageWrapper'
import LeagueNotFound from '../components/LeagueNotFound'

import { useSeason } from "../context/SeasonContext"
import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext';

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'

import { calculateTable } from '../utils/calculateTable'
import { getNextGameDay } from '../utils/getNextGameDay'
import { getRecentResults } from '../utils/getRecentResults'

import './Home.css'

function Home() {
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
  const nextGameDay = getNextGameDay(matchdays)
  const recentResults = getRecentResults(matchdays, 4)


  const pasesTD = [
    { id: 1, nombre: "Carlos Ramírez", equipo: "Halcones", touchdowns: 12 },
    { id: 2, nombre: "Luis Ortega", equipo: "Tigres", touchdowns: 10 },
    { id: 3, nombre: "Miguel Soto", equipo: "Panteras", touchdowns: 9 }
  ]

  const TD = [
    { id: 1, nombre: "Carlos Ramírez", equipo: "Halcones", touchdowns: 12 },
    { id: 2, nombre: "Luis Ortega", equipo: "Tigres", touchdowns: 10 },
    { id: 3, nombre: "Miguel Soto", equipo: "Panteras", touchdowns: 9 }
  ]

  const intercepciones = [
    { id: 1, nombre: "Jorge Díaz", equipo: "Leones", intercepciones: 5 },
    { id: 2, nombre: "Raúl Pérez", equipo: "Halcones", intercepciones: 4 }
  ];

  const sacks = [
    { id: 1, nombre: "Andrés Molina", equipo: "Tigres", sacks: 7 },
    { id: 2, nombre: "Fernando Cruz", equipo: "Panteras", sacks: 6 }
  ]

  const isLoading = loading || !league || loadingMatchdays

  if (!season) {
    return <LeagueNotFound/>
  }

return (
  <div className="app-shell">
    <Loader show={isLoading} label="Cargando..." />
    <PageWrapper loading={isLoading}/>
    <Header league={league}/>

    <main className="home-container">
      <CategorySelector
        categories={categories}
        active={category}
        onChange={setCategory}
      />

      <div className="cards-row">
        <StatsTable title="Touchdowns" statKey="touchdowns" data={TD.slice(0, 3)} />
        <StatsTable title="Pases de Touchdown" statKey="touchdowns" data={pasesTD.slice(0, 3)} />
        <StatsTable title="Intercepciones" statKey="intercepciones" data={intercepciones.slice(0, 3)} />
        <StatsTable title="Sacks" statKey="sacks" data={sacks.slice(0, 3)} />
      </div>

      <div className="home-layout">
        <div className="home-card positions-wrapper">
          <h2 className="card-title">Tabla de Posiciones</h2>
          <div className="card-body">
            <PositionTable table={calculatedTable} />
          </div>
        </div>

      <div className="right-column">
        <div className="home-card">
          <h2 className="card-title">Resultados Recientes</h2>
          <div className="card-body">
            <RecentResults games={recentResults} />
          </div>
        </div>

        <div className="home-card">
          <h2 className="card-title">Próxima Jornada</h2>
          <div className="card-body">
            <NextGameDay data={nextGameDay} />
          </div>
        </div>
      </div>
      </div>
    </main>

    <footer className="app-footer">
      © {new Date().getFullYear()} Liga · Todos los derechos reservados
    </footer>
  </div>
)

}


export default Home
