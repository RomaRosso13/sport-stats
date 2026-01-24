import { supabase } from '../libs/supabase'

export async function getMatchesByMatchDayIds(matchdayId) {
  const ids = Array.isArray(matchdayId)
  ? matchdayId
  : [matchdayId]

  const { data, error } = await supabase
    .from('Match')
      .select(`
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
      `)
    .in('matchday_id', ids)

  if (error) throw error
  return data
}

export async function getMatchesByMatchDayId(matchdayId) {
  const { data, error } = await supabase
    .from('Match')
      .select(`
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
      `)
    .eq('matchday_id', matchdayId)

  if (error) throw error
  return data
}

export async function updateMatches(matches) {
  const updates = matches.map(match => ({
    id: match.id,
    local_points: match.local_score,
    visit_points: match.away_score,
    status: match.status
  }))

  const { error } = await supabase
    .from('Match')
    .upsert(updates, { onConflict: 'id' })

  if (error) throw error
}


