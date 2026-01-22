import { supabase } from '../libs/supabase'

export async function getCategoriesBySeasonId(seasonId) {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .eq('season_id', seasonId)

  if (error) throw error
  return data
}
