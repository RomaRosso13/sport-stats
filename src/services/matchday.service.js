import { supabase } from '../libs/supabase'

export async function getMatchDaysByCategoryId(categoryId) {
  const { data, error } = await supabase
    .from('Matchday')
    .select('*')
    .eq('category_id', categoryId)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

export async function createMatchday(name, date, categoryId) {
  const { data, error } = await supabase
    .from('Matchday')
    .insert([{
      name: name,
      date: date,
      category_id: categoryId,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}