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
  invalidate('getPlayersByTeamIds')
}

// `personKey` es opcional: cuando se pasa (al dar de alta un jugador de
// franquicia en varias categorías a la vez, o al agregarle una categoría
// más a uno ya existente), varias filas de Player comparten ese mismo
// person_key y se tratan como "la misma persona" en el roster compartido.
// Si no se pasa, la columna usa su default (un uuid nuevo, sin compartir
// con nadie) — el comportamiento de siempre para un equipo normal.
export async function createPlayer(teamId, { name, number, position, imageUrl, personKey }) {
  const row = {
    team_id: Number(teamId),
    name,
    number: number === '' ? null : Number(number),
    position: position || null,
    image_url: imageUrl || null,
    active: true
  }
  if (personKey) row.person_key = personKey

  const result = await runQuery(
    supabase.from('Player').insert([row]).select().single()
  )

  invalidatePlayerCaches()
  return result
}

// Todas las filas de Player de la franquicia que comparten team_id dentro de
// los ids dados, agrupables después por person_key para armar el roster
// compartido de una franquicia.
export async function getPlayersByTeamIds(teamIds) {
  const ids = [...new Set((teamIds || []).filter(Boolean))]
  if (ids.length === 0) return []

  return cached('getPlayersByTeamIds', [ids.sort()], () =>
    runQuery(
      supabase.from('Player').select('*').in('team_id', ids)
    )
  )
}

// Edita los datos de la persona (nombre, número, posición, foto) en TODAS
// las categorías en las que juega a la vez, para que el roster compartido
// de una franquicia no se desincronice entre categorías.
export async function updatePlayersByPersonKey(personKey, { name, number, position, imageUrl }) {
  const result = await runQuery(
    supabase
      .from('Player')
      .update({
        name,
        number: number === '' ? null : Number(number),
        position: position || null,
        image_url: imageUrl || null
      })
      .eq('person_key', personKey)
      .select()
  )

  invalidatePlayerCaches()
  return result
}

export async function setPlayersActiveByPersonKey(personKey, active) {
  const result = await runQuery(
    supabase.from('Player').update({ active }).eq('person_key', personKey).select()
  )

  invalidatePlayerCaches()
  return result
}

// Usado al fusionar equipos en una franquicia: cuando el admin confirma que
// dos filas de Player (de equipos distintos) son la MISMA persona, se les
// asigna el mismo person_key para que de ahí en adelante se traten como un
// solo renglón en el roster compartido.
export async function setPersonKeyForPlayers(playerIds, personKey) {
  const result = await runQuery(
    supabase.from('Player').update({ person_key: personKey }).in('id', playerIds).select()
  )

  invalidatePlayerCaches()
  return result
}

// Borra a la persona completa (todas sus filas, en todas sus categorías).
export async function deletePlayersByPersonKey(personKey) {
  const rows = await runQuery(
    supabase.from('Player').select('id').eq('person_key', personKey),
    'No se pudo buscar al jugador'
  )
  const ids = (rows || []).map(r => r.id)
  if (ids.length === 0) return []

  await runQuery(
    supabase.from('IndividualStats').delete().in('player_id', ids),
    'No se pudieron eliminar las estadísticas del jugador'
  )
  await runQuery(
    supabase.from('MatchAttendance').delete().in('player_id', ids),
    'No se pudo eliminar la asistencia del jugador'
  )
  const result = await runQuery(
    supabase.from('Player').delete().in('id', ids),
    'No se pudo eliminar el jugador'
  )

  invalidatePlayerCaches()
  invalidate('getIndividualStatsByCategory')
  invalidate('getIndividualStatsByMatchId')
  invalidate('getAttendanceByMatchIds')
  invalidate('getAttendanceByPlayerId')

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

// Borra también todo lo que referencia a este jugador (estadísticas
// individuales, asistencia) antes de borrar su fila — si no, el borrado del
// jugador fallaría por la llave foránea en cuanto tuviera algún registro.
export async function deletePlayer(playerId) {
  await runQuery(
    supabase.from('IndividualStats').delete().eq('player_id', playerId),
    'No se pudieron eliminar las estadísticas del jugador'
  )

  await runQuery(
    supabase.from('MatchAttendance').delete().eq('player_id', playerId),
    'No se pudo eliminar la asistencia del jugador'
  )

  const result = await runQuery(
    supabase.from('Player').delete().eq('id', playerId),
    'No se pudo eliminar el jugador'
  )

  invalidatePlayerCaches()
  invalidate('getIndividualStatsByCategory')
  invalidate('getIndividualStatsByMatchId')
  invalidate('getAttendanceByMatchIds')
  invalidate('getAttendanceByPlayerId')

  return result
}
