import { useEffect, useState } from 'react'

import Header from "../components/common/Header"
import Footer from '../components/common/Footer'
import CategorySwitcher from "../components/filters/CategorySwitcher"
import DivisionFilter from "../components/filters/DivisionFilter"
import PositionTable from "../components/team/PositionTable"
import StandingsExportPanel from '../components/team/StandingsExportPanel'
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'
import { useSeason } from '../context/SeasonContext'
import { useAuth } from '../context/AuthContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'
import { getTeamsByCategoryId } from '../services/team.service'
import { getActiveDivisionsByCategoryId } from '../services/division.service'

import { calculateTable } from "../utils/calculateTable"
import { isPlayoffStage, isScrimmage } from "../utils/matchStages"
import { filterMatchesByDivision, filterTeamsByDivision } from "../utils/divisionFilter"
import { getDivisionColorMap } from "../utils/divisionColors"

import "./Standings.css"

function Standings() {
    const { league } = useLeague()
    const { categories, category, setCategory } = useCategory()
    const { season } = useSeason()
    const { user } = useAuth()
    const [matchdays, setMatchdays] = useState([])
    const [teams, setTeams] = useState([])
    const [, setLoadingMatchdays] = useState(true)
    const [divisions, setDivisions] = useState([])
    const [activeDivisionId, setActiveDivisionId] = useState(null)

    useEffect(() => {
      setActiveDivisionId(null)

      if (!category) {
        setDivisions([])
        return
      }

      async function loadDivisions() {
        try {
          const data = await getActiveDivisionsByCategoryId(category.id)
          setDivisions(data || [])
        } catch (err) {
          console.error(err)
        }
      }

      loadDivisions()
    }, [category?.id])

    useEffect(() => {
      if (!category) return

      async function loadMatchdays() {
        try {
          setLoadingMatchdays(true)

          const teamsData = await getTeamsByCategoryId(category.id)
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

        } catch (err) {
          console.error(err)
        } finally {
          setLoadingMatchdays(false)
        }
      }

      loadMatchdays()
    }, [category?.id])

    const regularSeasonMatchdays = matchdays.map(md => ({
      ...md,
      games: md.games.filter(m => !isPlayoffStage(m.type) && !isScrimmage(m.type))
    }))
    const matches = regularSeasonMatchdays.flatMap(j => j.games)
    // "General" (activeDivisionId null) usa todos los equipos/partidos, igual
    // que una liga sin divisiones. Con una división elegida, solo cuentan los
    // partidos entre dos equipos de esa misma división.
    const divisionMatches = filterMatchesByDivision(matches, activeDivisionId)
    const divisionTeams = filterTeamsByDivision(teams, activeDivisionId)
    // Se calcula con TODOS los equipos/partidos de la vista (para que el
    // récord del rival de un equipo desactivado siga siendo correcto), y
    // solo después se esconde la fila del equipo desactivado.
    const activeTeamIds = new Set(divisionTeams.filter(t => t.active !== false).map(t => t.id))
    // Los colores de división solo se muestran en "General" — si ya está
    // filtrado a una sola división, todas las filas serían del mismo color
    // y no aportaría nada.
    const showDivisionBadges = !activeDivisionId && divisions.length > 0
    const divisionColorById = getDivisionColorMap(divisions)
    const divisionNameById = Object.fromEntries(divisions.map(d => [d.id, d.name]))
    const calculatedTable = calculateTable(divisionMatches, divisionTeams)
      .filter(row => activeTeamIds.has(row.id))
      .map(row => (showDivisionBadges && row.division_id)
        ? { ...row, divisionColor: divisionColorById[row.division_id], divisionName: divisionNameById[row.division_id] }
        : row
      )

  const isDataLoading = !league || !matchdays.length
  const [showLoader, setShowLoader] = useState(true)
  const [showExportPanel, setShowExportPanel] = useState(false)

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
    <main className="standings-container">
      <CategorySwitcher categories={categories} active={category} onChange={setCategory}/>
      <DivisionFilter divisions={divisions} activeDivisionId={activeDivisionId} onChange={setActiveDivisionId}/>
      <div className="standings-header">
        <h2 className="standings-title">Tabla de Posiciones</h2>
        {user && (
          <button
            className="export-image-btn"
            onClick={() => setShowExportPanel(true)}
            disabled={isDataLoading}
          >
            Exportar imagen
          </button>
        )}
      </div>
      <PositionTable table={calculatedTable} matchdays={regularSeasonMatchdays} />
    </main>
    <Footer />

    {showExportPanel && (
      <StandingsExportPanel
        onClose={() => setShowExportPanel(false)}
        league={league}
        category={category}
        season={season}
        calculatedTable={calculatedTable}
        matchdays={regularSeasonMatchdays}
      />
    )}
  </div>
  )
}

export default Standings
