import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getTeamsByCategoryId(categoryId) {
  return cached('getTeamsByCategoryId', [categoryId], () =>
    runQuery(
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
  )
}

export async function getTeamById(teamId) {
  return cached('getTeamById', [teamId], () =>
    runQuery(
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
  )
}

function invalidateTeamCaches() {
  invalidate('getTeamsByCategoryId')
  invalidate('getTeamById')
}

export async function createTeam(categoryId, { name, logoUrl }) {
  const result = await runQuery(
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

  invalidateTeamCaches()
  return result
}

export async function updateTeam(teamId, { name, logoUrl }) {
  const result = await runQuery(
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

  invalidateTeamCaches()
  return result
}

export async function deleteTeam(teamId) {
  const result = await runQuery(
    supabase.from('Team').delete().eq('id', teamId),
    'No se pudo eliminar el equipo. Asegúrate de que no tenga jugadores o partidos asociados.'
  )

  invalidateTeamCaches()
  return result
}
