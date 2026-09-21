import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

// Categorías sin orden asignado (sort_order null) quedan al final, ordenadas
// por id (orden de creación) — así una liga que nunca reordena mantiene su
// comportamiento de siempre.
export async function getActiveCategoriesBySeasonId(seasonId) {
  return cached('getActiveCategoriesBySeasonId', [seasonId], () =>
    runQuery(
      supabase
        .from('Category')
        .select('*')
        .eq('season_id', seasonId)
        .eq('active', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('id', { ascending: true })
    )
  )
}

export async function getCategoriesBySeasonId(seasonId) {
  return cached('getCategoriesBySeasonId', [seasonId], () =>
    runQuery(
      supabase
        .from('Category')
        .select('*')
        .eq('season_id', seasonId)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('id', { ascending: true })
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

export async function updateCategory(categoryId, name) {
  const result = await runQuery(
    supabase.from('Category').update({ type: name }).eq('id', categoryId).select().single(),
    'No se pudo actualizar la categoría'
  )

  invalidateCategoryCaches()
  return result
}

// `orderedIds` es el arreglo completo de ids de la temporada en el nuevo
// orden deseado — se reescribe el sort_order de todas para que quede
// consistente (0, 1, 2...), no solo el de las dos que se intercambiaron.
export async function reorderCategories(orderedIds) {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      runQuery(
        supabase.from('Category').update({ sort_order: index }).eq('id', id).select().single(),
        'No se pudo actualizar el orden de las categorías'
      )
    )
  )

  invalidateCategoryCaches()
  return results
}

export async function setCategoryActive(categoryId, active) {
  const result = await runQuery(
    supabase.from('Category').update({ active }).eq('id', categoryId).select().single(),
    'No se pudo actualizar la categoría'
  )

  invalidateCategoryCaches()
  return result
}
