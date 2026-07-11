import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getActiveSeasonsByLeagueId(leagueId) {
  return runQuery(
    supabase
      .from('Season')
      .select('*')
      .eq('league_id', leagueId)
      .eq('active', true)
      .order('created_at', { ascending: true })
  )
}

export async function getSeasonsByLeagueId(leagueId) {
  return runQuery(
    supabase
      .from('Season')
      .select('*')
      .eq('league_id', leagueId)
      .order('created_at', { ascending: true })
  )
}

export async function createSeason(leagueId, name) {
  return runQuery(
    supabase
      .from('Season')
      .insert([{
        league_id: Number(leagueId),
        name: name,
        active: true
      }])
      .select()
      .single()
  )
}
