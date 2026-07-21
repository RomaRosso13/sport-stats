import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'
import { STAT_KEYS, STAT_LABEL_COLUMNS } from '../constants/statFields'

export async function getLeagueBySlug(slug) {
  return cached('getLeagueBySlug', [slug], () =>
    runQuery(
      supabase.from('League').select('*').eq('slug', slug).eq('active', true).single()
    ),
    5 * 60_000
  )
}

export async function updateLeague(leagueId, { name, imageUrl, primaryColor }) {
  const result = await runQuery(
    supabase
      .from('League')
      .update({
        name,
        image_url: imageUrl || null,
        primary_color: primaryColor || null
      })
      .eq('id', leagueId)
      .select()
      .single(),
    'No se pudo guardar la configuración de la liga'
  )

  invalidate('getLeagueBySlug')
  return result
}

export async function updateLeagueStatLabels(leagueId, labels) {
  const payload = {}
  STAT_KEYS.forEach(key => {
    payload[STAT_LABEL_COLUMNS[key]] = labels[key]?.trim() || null
  })

  const result = await runQuery(
    supabase.from('League').update(payload).eq('id', leagueId).select().single(),
    'No se pudo guardar los nombres de las estadísticas'
  )

  invalidate('getLeagueBySlug')
  return result
}
