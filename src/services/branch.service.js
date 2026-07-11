import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getBranchByLeagueId(leagueId) {
  return runQuery(
    supabase.from('Branch').select('*').eq('league_id', leagueId)
  )
}
