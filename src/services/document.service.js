import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getDocumentsByLeagueId(leagueId) {
  return cached('getDocumentsByLeagueId', [leagueId], () =>
    runQuery(
      supabase
        .from('Document')
        .select('*')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: false })
    )
  )
}

export async function createDocument(leagueId, { name, fileUrl }) {
  const result = await runQuery(
    supabase
      .from('Document')
      .insert([{
        league_id: Number(leagueId),
        name,
        file_url: fileUrl
      }])
      .select()
      .single(),
    'No se pudo guardar el documento'
  )

  invalidate('getDocumentsByLeagueId')
  return result
}
