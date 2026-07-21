import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getJornadaLinksBySeasonId(seasonId) {
  return cached('getJornadaLinksBySeasonId', [seasonId], () =>
    runQuery(
      supabase.from('JornadaLink').select('*').eq('season_id', seasonId)
    )
  )
}

export async function upsertJornadaLink(seasonId, date, url) {
  const result = await runQuery(
    supabase
      .from('JornadaLink')
      .upsert([{ season_id: Number(seasonId), date, url }], { onConflict: 'season_id,date' })
      .select()
      .single(),
    'No se pudo guardar el enlace'
  )

  invalidate('getJornadaLinksBySeasonId')
  return result
}

export async function deleteJornadaLink(id) {
  const result = await runQuery(
    supabase.from('JornadaLink').delete().eq('id', id),
    'No se pudo eliminar el enlace'
  )

  invalidate('getJornadaLinksBySeasonId')
  return result
}
