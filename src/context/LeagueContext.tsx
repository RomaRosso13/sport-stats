import { createContext, useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getLeagueBySlug } from "../services/league.service"
import { applyAccentColor } from "../utils/applyAccentColor"
import { applyLeagueBranding } from "../utils/applyLeagueBranding"

const LeagueContext = createContext(null)

export function LeagueProvider({ children }) {
  const { leagueSlug } = useParams()
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!leagueSlug) return
    loadLeague()
  }, [leagueSlug])

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

  // Quien guarda un cambio en la liga (Configuración General: criterios de
  // desempate, módulos del Inicio, nombres de estadísticas, etc.) ya invalida
  // la caché de getLeagueBySlug desde el service, pero este contexto solo
  // vuelve a pedir los datos cuando cambia leagueSlug — sin esto, el resto de
  // la app (ej. Inicio) seguiría viendo el `league` viejo en memoria hasta
  // recargar la página. Se llama justo después de guardar para refrescarlo
  // al instante, sin esperar a un refresh manual.
  function refreshLeague() {
    return loadLeague()
  }

  useEffect(() => {
    applyAccentColor(league?.primary_color)
  }, [league?.primary_color])

  useEffect(() => {
    applyLeagueBranding(league?.name, league?.image_url)
  }, [league?.name, league?.image_url])

  return (
    <LeagueContext.Provider value={{ league, loading, refreshLeague }}>
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
