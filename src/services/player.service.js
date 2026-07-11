import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getPlayerById(playerId) {
  return cached('getPlayerById', [playerId], () =>
    runQuery(
      supabase
        .from('Player')
        .select(`
          *,
          team:team_id (
            id,
            name,
            logo_url,
            category_id,
            category:category_id (
              id,
              type
            )
          )
        `)
        .eq('id', playerId)
        .single()
    )
  )
}

// Los jugadores vienen embebidos en las consultas de equipo (getTeamsByCategoryId/
// getTeamById), así que cualquier escritura aquí también invalida esos caches.
function invalidatePlayerCaches() {
  invalidate('getPlayerById')
  invalidate('getTeamsByCategoryId')
  invalidate('getTeamById')
}

export async function createPlayer(teamId, { name, number, position, imageUrl }) {
  const result = await runQuery(
    supabase
      .from('Player')
      .insert([{
        team_id: Number(teamId),
        name,
        number: number === '' ? null : Number(number),
        position: position || null,
        image_url: imageUrl || null,
        active: true
      }])
      .select()
      .single()
  )

  invalidatePlayerCaches()
  return result
}

export async function updatePlayer(playerId, { name, number, position, imageUrl, active }) {
  const result = await runQuery(
    supabase
      .from('Player')
      .update({
        name,
        number: number === '' ? null : Number(number),
        position: position || null,
        image_url: imageUrl || null,
        active
      })
      .eq('id', playerId)
      .select()
      .single()
  )

  invalidatePlayerCaches()
  return result
}

export async function setPlayerActive(playerId, active) {
  const result = await runQuery(
    supabase
      .from('Player')
      .update({ active })
      .eq('id', playerId)
      .select()
      .single()
  )

  invalidatePlayerCaches()
  return result
}
