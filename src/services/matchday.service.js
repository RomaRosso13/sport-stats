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

export async function createMatchday(name, date, categoryId) {
  const result = await runQuery(
    supabase
      .from('Matchday')
      .insert([{
        name: name,
        date: date,
        category_id: categoryId,
      }])
      .select()
      .single()
  )

  invalidate('getMatchDaysByCategoryId')
  return result
}
