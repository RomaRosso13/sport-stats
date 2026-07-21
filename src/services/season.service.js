import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getActiveSeasonsByLeagueId(leagueId) {
  return cached('getActiveSeasonsByLeagueId', [leagueId], () =>
    runQuery(
      supabase
        .from('Season')
        .select('*')
        .eq('league_id', leagueId)
        .eq('active', true)
        .order('created_at', { ascending: true })
    )
  )
}

export async function getSeasonsByLeagueId(leagueId) {
  return cached('getSeasonsByLeagueId', [leagueId], () =>
    runQuery(
      supabase
        .from('Season')
        .select('*')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: true })
    )
  )
}

function invalidateSeasonCaches() {
  invalidate('getSeasonsByLeagueId')
  invalidate('getActiveSeasonsByLeagueId')
}

export async function createSeason(leagueId, name) {
  const result = await runQuery(
    supabase
      .from('Season')
      .insert([{
        league_id: Number(leagueId),
        name: name,
        active: true
      }])
      .select()
      .single()
  )

  invalidateSeasonCaches()
  return result
}

export async function setSeasonActive(seasonId, active) {
  const result = await runQuery(
    supabase.from('Season').update({ active }).eq('id', seasonId).select().single(),
    'No se pudo actualizar la temporada'
  )

  invalidateSeasonCaches()
  return result
}

// Configuración del calendario (horario/duración de partidos) propia de cada
// temporada — los campos vacíos se guardan como null para que CalendarDay
// caiga en sus valores por defecto.
export async function updateSeasonCalendarConfig(seasonId, { startHour, endHour, stepMinutes, matchDurationMinutes }) {
  const toIntOrNull = value => (value === '' || value === null || value === undefined) ? null : Number(value)

  const result = await runQuery(
    supabase
      .from('Season')
      .update({
        start_hour: toIntOrNull(startHour),
        end_hour: toIntOrNull(endHour),
        step_minutes: toIntOrNull(stepMinutes),
        match_duration_minutes: toIntOrNull(matchDurationMinutes)
      })
      .eq('id', seasonId)
      .select()
      .single(),
    'No se pudo guardar la configuración del calendario'
  )

  invalidateSeasonCaches()
  return result
}
