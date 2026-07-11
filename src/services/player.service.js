import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function createPlayer(teamId, { name, number, position, imageUrl }) {
  return runQuery(
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
}

export async function updatePlayer(playerId, { name, number, position, imageUrl, active }) {
  return runQuery(
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
}

export async function setPlayerActive(playerId, active) {
  return runQuery(
    supabase
      .from('Player')
      .update({ active })
      .eq('id', playerId)
      .select()
      .single()
  )
}
