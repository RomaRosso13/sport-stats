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
