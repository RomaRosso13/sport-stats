import { useEffect } from 'react'
import { useState } from "react"

import Header from "../components/Header"
import CategorySelector from "../components/CategorySelector"
import TeamCard from "../components/TeamCard"

import { useLeague } from '../context/LeagueContext'
import { useSeason } from "../context/SeasonContext"
import { useCategory } from '../context/CategoryContext'

import { getMatchDaysByCategoryId } from '../services/matchday.service'
import { getMatchesByMatchDayIds } from '../services/match.service'
import { getTeamsByCategoryId } from '../services/team.service'

import "./Teams.css"

function Teams() {
  const { seasons, season, setSeason, loading } = useSeason()
  const { league, loading: leagueLoading } = useLeague()
  const { categories, category, setCategory, categoryLoading } = useCategory()
  const [matchdays, setMatchdays] = useState([])
  const [teams, setTeams] = useState([])
  const [loadingMatchdays, setLoadingMatchdays] = useState(true)

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

  console.log('Teams', teams)

  return (
    <div className = 'app-layout'>
    <Header league={league} seasons={seasons} season={season} />
    <main className="teams-container">
      <CategorySelector categories={categories} active={category} onChange={setCategory}/>
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
