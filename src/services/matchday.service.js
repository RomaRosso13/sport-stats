import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getMatchDaysByCategoryId(categoryId) {
  return cached('getMatchDaysByCategoryId', [categoryId], () =>
    runQuery(
      supabase
        .from('Matchday')
        .select('*')
        .eq('category_id', categoryId)
        .order('date', { ascending: true })
    )
  )
}

export async function getMatchDaysByCategoryIds(categoryIds) {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
  const sortedIds = [...ids].sort()

  return cached('getMatchDaysByCategoryIds', [sortedIds], () =>
    runQuery(
      supabase
        .from('Matchday')
        .select('*')
        .in('category_id', ids)
        .order('date', { ascending: true })
    )
  )
}

// Una "jornada" es compartida por todas las categorías activas: se crea un
// renglón de Matchday por categoría (mismo nombre y fecha) para que cada
// categoría tenga su propio matchday_id al que asociar sus partidos, pero
// desde la UI se ve y se crea como una sola jornada.
export async function createMatchdayForCategories(name, date, categoryIds) {
  const payload = categoryIds.map(categoryId => ({
    name,
    date,
    category_id: categoryId
  }))

  const result = await runQuery(
    supabase
      .from('Matchday')
      .insert(payload)
      .select()
  )

  invalidate('getMatchDaysByCategoryId')
  invalidate('getMatchDaysByCategoryIds')
  return result
}
