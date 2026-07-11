import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getLeagueBySlug(slug) {
  return runQuery(
    supabase.from('League').select('*').eq('slug', slug).eq('active', true).single()
  )
}
