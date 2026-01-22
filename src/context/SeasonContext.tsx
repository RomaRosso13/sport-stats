import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { getLeagueBySlug } from '../services/league.service'
import { getSeasonsByLeagueId } from '../services/season.service'

const SeasonContext = createContext(null)

export function SeasonProvider({ children }) {
  const [seasons, setSeasons] = useState([])
  const [season, setSeason] = useState(null)
  const [loading, setLoading] = useState(true)

  const { leagueSlug } = useParams()

  // 1️⃣ Cargar seasons SOLO cuando cambia la liga
  useEffect(() => {
    if (!leagueSlug) return

    async function loadSeasons() {
      try {
        setLoading(true)

        const league = await getLeagueBySlug(leagueSlug)
        const seasonsData = await getSeasonsByLeagueId(league.id)

        setSeasons(seasonsData)

        if (seasonsData.length > 0) {
          const savedSeasonId = localStorage.getItem(
            `activeSeason:${leagueSlug}`
          )

          const savedSeason = seasonsData.find(
            s => s.id === savedSeasonId
          )

          // ⚠️ CLAVE: nunca dejar season en null si hay seasons
          setSeason(prevSeason =>
            savedSeason || prevSeason || seasonsData[0]
          )
        } else {
          setSeason(null)
        }

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadSeasons()
  }, [leagueSlug])

  // 2️⃣ Persistir season activa
  useEffect(() => {
    if (season && leagueSlug) {
      localStorage.setItem(
        `activeSeason:${leagueSlug}`,
        season.id
      )
    }
  }, [season, leagueSlug])

  return (
    <SeasonContext.Provider
      value={{ seasons, season, setSeason, loading }}
    >
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  const context = useContext(SeasonContext)
  if (!context) {
    throw new Error('useSeason debe usarse dentro de SeasonProvider')
  }
  return context
}
