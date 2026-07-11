import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

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
  )
`

export async function getMatchesByMatchDayIds(matchdayId) {
  const ids = Array.isArray(matchdayId) ? matchdayId : [matchdayId]

  return runQuery(
    supabase.from('Match').select(MATCH_SELECT).in('matchday_id', ids)
  )
}

export async function getMatchById(matchId) {
  return runQuery(
    supabase.from('Match').select(MATCH_SELECT).eq('id', matchId).single()
  )
}

export async function updateMatches(matches) {
  const updates = matches.map(match => ({
    id: match.id,
    local_points: match.local_score,
    visit_points: match.away_score,
    status: match.status
  }))

  await runQuery(
    supabase.from('Match').upsert(updates, { onConflict: 'id' })
  )
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

  return runQuery(
    supabase.from('Match').insert(payload).select(),
    'Error al crear los partidos'
  )
}
