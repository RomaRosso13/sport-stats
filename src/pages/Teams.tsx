import { useEffect } from 'react'
import { useState } from "react"

import Header from "../components/common/Header"
import CategorySwitcher from "../components/filters/CategorySwitcher"
import TeamCard from "../components/team/TeamCard"
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'

import { useLeague } from '../context/LeagueContext'
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'
import { getTeamsByCategoryId } from '../services/team.service'

import "./Teams.css"

function Teams() {
  const { league } = useLeague()
  const { categories, category, setCategory } = useCategory()
  const [matchdays, setMatchdays] = useState([])
  const [teams, setTeams] = useState([])
  const [, setLoadingMatchdays] = useState(true)

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

        setTeams(teamsData)
        setMatchdays(combined)

      } catch (err) {
        console.error(err)
      } finally {
        setLoadingMatchdays(false)
      }
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
    <div className = 'app-layout'>
    <Loader show={showLoader} label="Cargando..." />
    <PageWrapper loading={showLoader}/>
    <Header league={league}/>
    <main className="teams-container">
      <CategorySwitcher categories={categories} active={category} onChange={setCategory}/>
      <h2 className="teams-title">Equipos</h2>
        <div className="teams-grid">
          {teams.map(team => (
            <TeamCard key={team.id} team={team} matchdays={matchdays}/>
          ))}
        </div>
      </main>
      <footer className="app-footer">
      © {new Date().getFullYear()} Liga · Todos los derechos reservados
    </footer>
    </div>
  )
}

export default Teams
