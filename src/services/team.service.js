import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getTeamsByCategoryId(categoryId) {
  return cached('getTeamsByCategoryId', [categoryId], () =>
    runQuery(
      supabase
        .from('Team')
        .select(`
          *,
          Player (
            id,
            name,
            position,
            number,
            image_url,
            active
          )
        `)
        .eq('category_id', categoryId)
    )
  )
}

export async function getTeamsByCategoryIds(categoryIds) {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
  const sortedIds = [...ids].sort()

  return cached('getTeamsByCategoryIds', [sortedIds], () =>
    runQuery(
      supabase
        .from('Team')
        .select(`
          *,
          Player (
            id,
            name,
            position,
            number,
            image_url,
            active
          )
        `)
        .in('category_id', ids)
    )
  )
}

export async function getTeamsByIds(teamIds) {
  const ids = Array.isArray(teamIds) ? teamIds : [teamIds]
  if (!ids.length) return []

  const sortedIds = [...ids].sort()

  return cached('getTeamsByIds', [sortedIds], () =>
    runQuery(
      supabase
        .from('Team')
        .select(`
          *,
          category:category_id (
            id,
            type
          ),
          Player (
            id,
            name,
            position,
            number,
            image_url,
            active
          )
        `)
        .in('id', ids)
        .order('name')
    )
  )
}

export async function getTeamById(teamId) {
  return cached('getTeamById', [teamId], () =>
    runQuery(
      supabase
        .from('Team')
        .select(`
          *,
          category:category_id (
            id,
            type
          ),
          Player (
            id,
            name,
            position,
            number,
            image_url,
            active
          )
        `)
        .eq('id', teamId)
        .single()
    )
  )
}

function invalidateTeamCaches() {
  invalidate('getTeamsByCategoryId')
  invalidate('getTeamsByCategoryIds')
  invalidate('getTeamById')
  invalidate('getTeamsByIds')
}

export async function createTeam(categoryId, { name, logoUrl, primaryColor }) {
  const result = await runQuery(
    supabase
      .from('Team')
      .insert([{
        category_id: Number(categoryId),
        name,
        logo_url: logoUrl || null,
        primary_color: primaryColor || null
      }])
      .select()
      .single()
  )

  invalidateTeamCaches()
  return result
}

export async function updateTeam(teamId, { name, logoUrl, primaryColor }) {
  const result = await runQuery(
    supabase
      .from('Team')
      .update({
        name,
        logo_url: logoUrl || null,
        primary_color: primaryColor || null
      })
      .eq('id', teamId)
      .select()
      .single()
  )

  invalidateTeamCaches()
  return result
}

export async function setTeamActive(teamId, active) {
  const result = await runQuery(
    supabase
      .from('Team')
      .update({ active })
      .eq('id', teamId)
      .select()
      .single()
  )

  invalidateTeamCaches()
  return result
}

// Borra también todo rastro del equipo: sus partidos (y las estadísticas y
// asistencia de ESOS partidos, que también afectan al rival), sus jugadores
// y su asignación de coach — para que sea como si el equipo (y los partidos
// que jugó) nunca hubieran existido. El rival de esos partidos sigue en la
// liga, solo que sus datos quedan como si no hubiera jugado esos partidos,
// porque la tabla/estadísticas se calculan siempre a partir de los partidos
// que sí quedan.
export async function deleteTeam(teamId) {
  const id = Number(teamId)

  const matches = await runQuery(
    supabase
      .from('Match')
      .select('id')
      .or(`local_team_id.eq.${id},visit_team_id.eq.${id}`),
    'No se pudieron buscar los partidos del equipo'
  )

  const matchIds = (matches || []).map(m => m.id)

  if (matchIds.length) {
    await runQuery(
      supabase.from('IndividualStats').delete().in('match_id', matchIds),
      'No se pudieron eliminar las estadísticas de los partidos del equipo'
    )

    await runQuery(
      supabase.from('MatchAttendance').delete().in('match_id', matchIds),
      'No se pudo eliminar la asistencia de los partidos del equipo'
    )

    await runQuery(
      supabase.from('Match').delete().in('id', matchIds),
      'No se pudieron eliminar los partidos del equipo'
    )
  }

  // Por si queda algún rastro de estadísticas/asistencia no ligado a alguno
  // de los partidos de arriba.
  await runQuery(
    supabase.from('IndividualStats').delete().eq('team_id', id),
    'No se pudieron eliminar las estadísticas del equipo'
  )

  await runQuery(
    supabase.from('MatchAttendance').delete().eq('team_id', id),
    'No se pudo eliminar la asistencia del equipo'
  )

  await runQuery(
    supabase.from('Player').delete().eq('team_id', id),
    'No se pudieron eliminar los jugadores del equipo'
  )

  await runQuery(
    supabase.from('League_User_Team').delete().eq('team_id', id),
    'No se pudo quitar la asignación de coach del equipo'
  )

  const result = await runQuery(
    supabase.from('Team').delete().eq('id', id),
    'No se pudo eliminar el equipo.'
  )

  invalidateTeamCaches()
  invalidate('getPlayerById')
  invalidate('getIndividualStatsByCategory')
  invalidate('getIndividualStatsByMatchId')
  invalidate('getAttendanceByMatchIds')
  invalidate('getAttendanceByPlayerId')
  invalidate('getMatchesByMatchDayIds')
  invalidate('getMatchById')
  invalidate('getHeadToHeadMatches')

  return result
}
