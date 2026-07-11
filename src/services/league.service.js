import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached } from '../utils/queryCache'

export async function getLeagueBySlug(slug) {
  return cached('getLeagueBySlug', [slug], () =>
    runQuery(
      supabase.from('League').select('*').eq('slug', slug).eq('active', true).single()
    ),
    5 * 60_000
  )
}
