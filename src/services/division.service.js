import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getActiveDivisionsByCategoryId(categoryId) {
  return cached('getActiveDivisionsByCategoryId', [categoryId], () =>
    runQuery(
      supabase.from('Division').select('*').eq('category_id', categoryId).eq('active', true)
    )
  )
}

export async function getDivisionsByCategoryId(categoryId) {
  return cached('getDivisionsByCategoryId', [categoryId], () =>
    runQuery(
      supabase.from('Division').select('*').eq('category_id', categoryId)
    )
  )
}

// Para vistas que combinan TODAS las categorías de la temporada a la vez
// (ej. el ranking general de toda la liga en Estadísticas).
export async function getActiveDivisionsByCategoryIds(categoryIds) {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
  const sortedIds = [...ids].sort()

  return cached('getActiveDivisionsByCategoryIds', [sortedIds], () =>
    runQuery(
      supabase.from('Division').select('*').in('category_id', ids).eq('active', true)
    )
  )
}

function invalidateDivisionCaches() {
  invalidate('getDivisionsByCategoryId')
  invalidate('getActiveDivisionsByCategoryId')
  invalidate('getActiveDivisionsByCategoryIds')
}

export async function createDivision(categoryId, name) {
  const result = await runQuery(
    supabase
      .from('Division')
      .insert([{
        category_id: Number(categoryId),
        name,
        active: true
      }])
      .select()
      .single()
  )

  invalidateDivisionCaches()
  return result
}

export async function setDivisionActive(divisionId, active) {
  const result = await runQuery(
    supabase.from('Division').update({ active }).eq('id', divisionId).select().single(),
    'No se pudo actualizar la división'
  )

  invalidateDivisionCaches()
  return result
}
