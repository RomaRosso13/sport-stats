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
    name
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
      supabase.from('Match').select(MATCH_SELECT).in('matchday_id', ids)
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
  const updates = matches.map(match => {
    const row = {
      id: match.id,
      local_points: match.local_score,
      visit_points: match.away_score,
      status: match.status
    }

    if (!match.submitted_by && currentUserId) {
      row.submitted_by = currentUserId
    }

    return row
  })

  await runQuery(
    supabase.from('Match').upsert(updates, { onConflict: 'id' })
  )

  invalidate('getMatchesByMatchDayIds')
  invalidate('getMatchById')
}

export async function createMatches(matches, matchday) {
  const payload = matches.map(match => ({
    date: matchday.date,
    hour: match.time,
    type: match.type || 'Regular',
    local_team_id: match.homeTeamId,
    visit_team_id: match.awayTeamId,
    status: 'Pendiente',
    branch_id: Number(match.branchId),
    field_id: Number(match.field),
    matchday_id: matchday.id
  }))

  const result = await runQuery(
    supabase.from('Match').insert(payload).select(),
    'Error al crear los partidos'
  )

  invalidate('getMatchesByMatchDayIds')
  return result
}
