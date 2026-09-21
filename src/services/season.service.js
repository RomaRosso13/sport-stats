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

// Deja la temporada "como nueva": borra jornadas, partidos, estadísticas
// individuales, asistencia y los enlaces de crónica de jornada de TODAS sus
// categorías (activas o archivadas). NO toca Category, Team ni Player — el
// roster y las categorías quedan intactos para reiniciar el calendario desde
// cero. El orden de los deletes respeta las llaves foráneas: primero lo que
// depende de un partido/categoría, luego los partidos, y al final las jornadas.
export async function resetSeason(seasonId) {
  const categories = await runQuery(
    supabase.from('Category').select('id').eq('season_id', seasonId),
    'No se pudieron leer las categorías de la temporada'
  )
  const categoryIds = categories.map(c => c.id)

  if (categoryIds.length > 0) {
    await runQuery(
      supabase.from('IndividualStats').delete().in('category_id', categoryIds),
      'No se pudieron eliminar las estadísticas'
    )

    await runQuery(
      supabase.from('MatchAttendance').delete().in('category_id', categoryIds),
      'No se pudo eliminar la asistencia'
    )

    const matchdays = await runQuery(
      supabase.from('Matchday').select('id').in('category_id', categoryIds),
      'No se pudieron leer las jornadas de la temporada'
    )
    const matchdayIds = matchdays.map(m => m.id)

    if (matchdayIds.length > 0) {
      await runQuery(
        supabase.from('Match').delete().in('matchday_id', matchdayIds),
        'No se pudieron eliminar los partidos'
      )
    }

    await runQuery(
      supabase.from('Matchday').delete().in('category_id', categoryIds),
      'No se pudieron eliminar las jornadas'
    )
  }

  await runQuery(
    supabase.from('JornadaLink').delete().eq('season_id', seasonId),
    'No se pudieron eliminar los enlaces de jornada'
  )

  invalidate('getMatchDaysByCategoryId')
  invalidate('getMatchDaysByCategoryIds')
  invalidate('getMatchesByMatchDayIds')
  invalidate('getMatchById')
  invalidate('getHeadToHeadMatches')
  invalidate('getIndividualStatsByCategory')
  invalidate('getIndividualStatsByMatchId')
  invalidate('getAttendanceByMatchIds')
  invalidate('getAttendanceByPlayerId')
  invalidate('getJornadaLinksBySeasonId')

  return true
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
