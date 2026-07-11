import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getActiveCategoriesBySeasonId(seasonId) {
  return runQuery(
    supabase.from('Category').select('*').eq('season_id', seasonId).eq('active', true)
  )
}

export async function getCategoriesBySeasonId(seasonId) {
  return runQuery(
    supabase.from('Category').select('*').eq('season_id', seasonId)
  )
}

export async function createCategory(seasonId, name) {
  return runQuery(
    supabase
      .from('Category')
      .insert([{
        season_id: Number(seasonId),
        type: name,
        active: true
      }])
      .select()
      .single()
  )
}
