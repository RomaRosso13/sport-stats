import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getActiveSeasonsByLeagueId(leagueId) {
  return cached('getActiveSeasonsByLeagueId', [leagueId], () =>
    runQuery(
      supabase
        .from('Season')
        .select('*')
        .eq('league_id', leagueId)
        .eq('active', true)
        .order('created_at', { ascending: true })
    )
  )
}

export async function getSeasonsByLeagueId(leagueId) {
  return cached('getSeasonsByLeagueId', [leagueId], () =>
    runQuery(
      supabase
        .from('Season')
        .select('*')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: true })
    )
  )
}

function invalidateSeasonCaches() {
  invalidate('getSeasonsByLeagueId')
  invalidate('getActiveSeasonsByLeagueId')
}

export async function createSeason(leagueId, name) {
  const result = await runQuery(
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

  invalidateSeasonCaches()
  return result
}

export async function setSeasonActive(seasonId, active) {
  const result = await runQuery(
    supabase.from('Season').update({ active }).eq('id', seasonId).select().single(),
    'No se pudo actualizar la temporada'
  )

  invalidateSeasonCaches()
  return result
}
