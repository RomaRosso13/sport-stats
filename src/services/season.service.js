import { supabase } from '../libs/supabase'

export async function getSeasonsByLeagueId(leagueId) {
  const { data, error } = await supabase
    .from('Season')
    .select('*')
    .eq('league_id', leagueId)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}
