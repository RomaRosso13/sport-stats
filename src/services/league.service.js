import { supabase } from '../libs/supabase'

export async function getLeagueBySlug(slug) {
  const { data, error } = await supabase
    .from('League')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

