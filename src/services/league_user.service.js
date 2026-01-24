import { supabase } from '../libs/supabase'

export async function userBelongsToLeague(leagueId) {
  console.log('LeagueId', leagueId)
  const { data, error } = await supabase
    .from('League_User')
    .select('id')
    .eq('league_id', leagueId)
    .limit(1)

  if (error) throw error

  return data.length > 0
}
