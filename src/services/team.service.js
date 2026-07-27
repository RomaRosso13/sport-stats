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

export async function getTeamsByCategoryIds(categoryIds) {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
  const sortedIds = [...ids].sort()

  return cached('getTeamsByCategoryIds', [sortedIds], () =>
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
        .in('category_id', ids)
    )
  )
}

export async function getTeamsByIds(teamIds) {
  const ids = Array.isArray(teamIds) ? teamIds : [teamIds]
  if (!ids.length) return []

  const sortedIds = [...ids].sort()

  return cached('getTeamsByIds', [sortedIds], () =>
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
        .in('id', ids)
        .order('name')
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
  invalidate('getTeamsByCategoryIds')
  invalidate('getTeamById')
  invalidate('getTeamsByIds')
}

export async function createTeam(categoryId, { name, logoUrl, primaryColor }) {
  const result = await runQuery(
    supabase
      .from('Team')
      .insert([{
        category_id: Number(categoryId),
        name,
        logo_url: logoUrl || null,
        primary_color: primaryColor || null
      }])
      .select()
      .single()
  )

  invalidateTeamCaches()
  return result
}

export async function updateTeam(teamId, { name, logoUrl, primaryColor }) {
  const result = await runQuery(
    supabase
      .from('Team')
      .update({
        name,
        logo_url: logoUrl || null,
        primary_color: primaryColor || null
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
