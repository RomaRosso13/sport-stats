import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

const MATCH_SELECT = `
  *,
  local_team:local_team_id (
    id,
    name,
    logo_url
  ),
  visit_team:visit_team_id (
    id,
    name,
    logo_url
  ),
  branch:branch_id (
    id,
    name,
    maps_url
  ),
  field:field_id (
    id,
    name
  ),
  submitter:submitted_by (
    id,
    name,
    email
  )
`

export async function getMatchesByMatchDayIds(matchdayId) {
  const ids = Array.isArray(matchdayId) ? matchdayId : [matchdayId]
  const sortedIds = [...ids].sort()

  return cached('getMatchesByMatchDayIds', [sortedIds], () =>
    runQuery(
      supabase.from('Match').select(MATCH_SELECT).in('matchday_id', ids).order('hour', { ascending: true })
    )
  )
}

// Enfrentamientos previos ENTRE estos dos equipos específicos (en cualquier
// categoría/temporada), excluyendo el partido actual para no repetirlo.
export async function getHeadToHeadMatches(teamAId, teamBId, excludeMatchId) {
  // Se fuerza a número antes de interpolar en el filtro .or() de PostgREST
  // (no acepta placeholders para esta sintaxis) — así un valor no numérico
  // se vuelve NaN de forma inofensiva en vez de poder alterar el filtro.
  const teamA = Number(teamAId)
  const teamB = Number(teamBId)

  return cached('getHeadToHeadMatches', [teamA, teamB, excludeMatchId], () =>
    runQuery(
      supabase
        .from('Match')
        .select(MATCH_SELECT)
        .or(`and(local_team_id.eq.${teamA},visit_team_id.eq.${teamB}),and(local_team_id.eq.${teamB},visit_team_id.eq.${teamA})`)
        .eq('status', 'Terminado')
        .neq('id', excludeMatchId)
        .order('date', { ascending: false })
    )
  )
}

export async function getMatchById(matchId) {
  return cached('getMatchById', [matchId], () =>
    runQuery(
      supabase.from('Match').select(MATCH_SELECT).eq('id', matchId).single()
    )
  )
}

// `currentUserId` (id interno de User, no el auth uuid) se guarda como
// `submitted_by` solo la primera vez que un partido recibe un resultado,
// para conservar la atribución al capturador original aunque un admin
// lo apruebe/edite después.
export async function updateMatches(matches, currentUserId) {
  await Promise.all(matches.map(match => {
    const row = {
      local_points: match.local_score,
      visit_points: match.away_score,
      status: match.status
    }

    if (!match.submitted_by && currentUserId) {
      row.submitted_by = currentUserId
    }

    return runQuery(
      supabase.from('Match').update(row).eq('id', match.id)
    )
  }))

  invalidate('getMatchesByMatchDayIds')
  invalidate('getMatchById')
}

// Edita los datos de programación de un partido ya guardado (equipos, sede,
// cancha, hora, fase, categoría/jornada) — distinto de updateMatches, que solo
// toca marcador y estatus al registrar resultados.
export async function updateMatchDetails(matchId, { homeTeamId, awayTeamId, branchId, field, time, type, matchdayId }) {
  const result = await runQuery(
    supabase
      .from('Match')
      .update({
        local_team_id: homeTeamId,
        visit_team_id: awayTeamId,
        branch_id: Number(branchId),
        field_id: Number(field),
        hour: time,
        type: type || 'Regular',
        matchday_id: matchdayId
      })
      .eq('id', matchId)
      .select(MATCH_SELECT)
      .single()
  )

  invalidate('getMatchesByMatchDayIds')
  invalidate('getMatchById')
  return result
}

export async function deleteMatch(matchId) {
  // .select() fuerza a que la respuesta traiga las filas realmente borradas:
  // si RLS bloquea el delete, Postgres no lanza error (solo afecta 0 filas),
  // así que sin esto el fallo pasaría desapercibido y la UI lo daría por bueno.
  const result = await runQuery(
    supabase.from('Match').delete().eq('id', matchId).select(),
    'No se pudo eliminar el partido.'
  )

  if (!result || result.length === 0) {
    throw new Error('No se pudo eliminar el partido. Es posible que no tengas permisos suficientes.')
  }

  invalidate('getMatchesByMatchDayIds')
  invalidate('getMatchById')
  return result
}

export async function createMatches(matches) {
  const payload = matches.map(match => ({
    date: match.date,
    hour: match.time,
    type: match.type || 'Regular',
    local_team_id: match.homeTeamId,
    visit_team_id: match.awayTeamId,
    status: 'Pendiente',
    branch_id: Number(match.branchId),
    field_id: Number(match.field),
    matchday_id: match.matchdayId
  }))

  const result = await runQuery(
    supabase.from('Match').insert(payload).select(),
    'Error al crear los partidos'
  )

  invalidate('getMatchesByMatchDayIds')
  return result
}
