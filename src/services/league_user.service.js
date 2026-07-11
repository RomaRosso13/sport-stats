import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function userBelongsToLeague(leagueId) {
  const data = await runQuery(
    supabase.from('League_User').select('id').eq('league_id', leagueId).limit(1)
  )

  return data.length > 0
}
