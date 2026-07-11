import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getTeamsByCategoryId(categoryId) {
  return runQuery(
    supabase
      .from('Team')
      .select(`
        *,
        Player (
          id,
          name,
          position,
          number,
          image_url,
          active
        )
      `)
      .eq('category_id', categoryId)
  )
}

export async function getTeamById(teamId) {
  return runQuery(
    supabase
      .from('Team')
      .select(`
        *,
        category:category_id (
          id,
          type
        ),
        Player (
          id,
          name,
          position,
          number,
          image_url,
          active
        )
      `)
      .eq('id', teamId)
      .single()
  )
}

export async function createTeam(categoryId, { name, logoUrl }) {
  return runQuery(
    supabase
      .from('Team')
      .insert([{
        category_id: Number(categoryId),
        name,
        logo_url: logoUrl || null
      }])
      .select()
      .single()
  )
}

export async function updateTeam(teamId, { name, logoUrl }) {
  return runQuery(
    supabase
      .from('Team')
      .update({
        name,
        logo_url: logoUrl || null
      })
      .eq('id', teamId)
      .select()
      .single()
  )
}
