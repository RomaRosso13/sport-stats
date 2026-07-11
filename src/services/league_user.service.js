import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function userBelongsToLeague(authUserId, leagueId) {
  if (!authUserId || !leagueId) return false

  const userRow = await runQuery(
    supabase.from('User').select('id').eq('auth_user_id', authUserId).maybeSingle()
  )

  if (!userRow) return false

  const memberships = await runQuery(
    supabase.from('League_User').select('id').eq('league_id', leagueId).eq('user_id', userRow.id).limit(1)
  )

  return memberships.length > 0
}
