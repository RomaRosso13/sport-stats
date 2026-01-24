import { supabase } from '../libs/supabase'

export async function getBranchByLeagueId(leagueId) {
  const { data, error } = await supabase
    .from('Branch')
    .select('*')
    .eq('league_id', leagueId)

  if (error) throw error
  return data
}
