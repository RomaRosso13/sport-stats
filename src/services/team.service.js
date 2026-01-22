import { supabase } from '../libs/supabase'

export async function getTeamsByCategoryId(categoryId) {
  const { data, error } = await supabase
    .from('Team')
    .select('*')
    .eq('category_id', categoryId)

  if (error) throw error
  return data
}
