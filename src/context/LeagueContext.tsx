import { createContext, useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getLeagueBySlug } from "../services/league.service"

const LeagueContext = createContext(null)

export function LeagueProvider({ children }) {
  const { leagueSlug } = useParams()
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!leagueSlug) return

    async function loadLeague() {
      try {
        setLoading(true)
        const leagueData = await getLeagueBySlug(leagueSlug)
        setLeague(leagueData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadLeague()
  }, [leagueSlug])

  return (
    <LeagueContext.Provider value={{ league, loading }}>
      {children}
    </LeagueContext.Provider>
  )
}

export function useLeague() {
  const context = useContext(LeagueContext)
  if (!context) {
    throw new Error("useLeague debe usarse dentro de LeagueProvider")
  }
  return context
}
