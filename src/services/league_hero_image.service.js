import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getHeroImagesByLeagueId(leagueId) {
  return cached('getHeroImagesByLeagueId', [leagueId], () =>
    runQuery(
      supabase
        .from('LeagueHeroImage')
        .select('*')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: true })
    )
  )
}

export async function addHeroImage(leagueId, imageUrl) {
  const result = await runQuery(
    supabase
      .from('LeagueHeroImage')
      .insert([{ league_id: Number(leagueId), image_url: imageUrl }])
      .select()
      .single(),
    'No se pudo guardar la imagen'
  )

  invalidate('getHeroImagesByLeagueId')
  return result
}

export async function deleteHeroImage(id) {
  const result = await runQuery(
    supabase.from('LeagueHeroImage').delete().eq('id', id),
    'No se pudo eliminar la imagen'
  )

  invalidate('getHeroImagesByLeagueId')
  return result
}
