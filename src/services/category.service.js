import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getActiveCategoriesBySeasonId(seasonId) {
  return cached('getActiveCategoriesBySeasonId', [seasonId], () =>
    runQuery(
      supabase.from('Category').select('*').eq('season_id', seasonId).eq('active', true)
    )
  )
}

export async function getCategoriesBySeasonId(seasonId) {
  return cached('getCategoriesBySeasonId', [seasonId], () =>
    runQuery(
      supabase.from('Category').select('*').eq('season_id', seasonId)
    )
  )
}

function invalidateCategoryCaches() {
  invalidate('getCategoriesBySeasonId')
  invalidate('getActiveCategoriesBySeasonId')
}

export async function createCategory(seasonId, name) {
  const result = await runQuery(
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

  invalidateCategoryCaches()
  return result
}

export async function setCategoryActive(categoryId, active) {
  const result = await runQuery(
    supabase.from('Category').update({ active }).eq('id', categoryId).select().single(),
    'No se pudo actualizar la categoría'
  )

  invalidateCategoryCaches()
  return result
}
