// Guarda qué liga eligió el usuario en este dispositivo para que la próxima
// vez que abra la app entre directo a su Home, sin pasar por el selector.
const KEY = 'flagstats_default_league_slug'

export function getDefaultLeagueSlug() {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setDefaultLeagueSlug(slug) {
  try {
    window.localStorage.setItem(KEY, slug)
  } catch {
    // Modo privado/incógnito puede bloquear localStorage; no es crítico.
  }
}

export function clearDefaultLeagueSlug() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // no-op
  }
}
