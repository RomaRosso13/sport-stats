import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getMatchDaysByCategoryId(categoryId) {
  return runQuery(
    supabase
      .from('Matchday')
      .select('*')
      .eq('category_id', categoryId)
      .order('date', { ascending: true })
  )
}

export async function createMatchday(name, date, categoryId) {
  return runQuery(
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
}
