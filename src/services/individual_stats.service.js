import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'
import { STAT_KEYS } from '../constants/statFields'
import { isScrimmage } from '../utils/matchStages'

const STATS_SELECT = `
  *,
  player:player_id (
    id,
    name,
    number,
    image_url
  ),
  team:team_id (
    id,
    name,
    logo_url
  ),
  match:match_id (
    type
  )
`

// Totales/líderes de temporada: los partidos de scrimmage se excluyen aquí
// (no en getIndividualStatsByMatchId) para que el editor de un partido
// puntual siga pudiendo capturar sus estadísticas normalmente.
export async function getIndividualStatsByCategory(categoryId) {
  const rows = await cached('getIndividualStatsByCategory', [categoryId], () =>
    runQuery(
      supabase
        .from('IndividualStats')
        .select(STATS_SELECT)
        .eq('category_id', categoryId)
    )
  )

  return (rows || []).filter(row => !isScrimmage(row.match?.type))
}

export async function getIndividualStatsByMatchId(matchId) {
  return cached('getIndividualStatsByMatchId', [matchId], () =>
    runQuery(
      supabase
        .from('IndividualStats')
        .select(STATS_SELECT)
        .eq('match_id', matchId)
    )
  )
}

// `entries`: [{ matchId, playerId, teamId, touchdown, touchdown_pass, sacks, interceptions }]
// IndividualStats stores one row per player per match, so season/category totals are
// simply the sum across every match row for that player (see classifyTopPlayersByStats).
// Each entry is a DELTA added on top of that player's existing row for THIS match, so
// re-opening and re-saving the stats panel for the same match keeps accumulating correctly.
export async function saveIndividualStatsForMatch(categoryId, entries) {
  const withChanges = entries.filter(entry =>
    STAT_KEYS.some(field => entry[field])
  )

  if (!withChanges.length) return []

  const matchIds = [...new Set(withChanges.map(entry => entry.matchId))]
  const playerIds = [...new Set(withChanges.map(entry => entry.playerId))]

  const existingRows = await runQuery(
    supabase
      .from('IndividualStats')
      .select('*')
      .eq('category_id', categoryId)
      .in('match_id', matchIds)
      .in('player_id', playerIds)
  )

  const existingByKey = {}
  existingRows.forEach(row => { existingByKey[`${row.match_id}_${row.player_id}`] = row })

  const updates = []
  const inserts = []

  withChanges.forEach(entry => {
    const existing = existingByKey[`${entry.matchId}_${entry.playerId}`]

    if (existing) {
      const fields = {}
      STAT_KEYS.forEach(field => {
        fields[field] = (existing[field] || 0) + (entry[field] || 0)
      })
      updates.push({ id: existing.id, fields })
    } else {
      const row = {
        player_id: entry.playerId,
        team_id: entry.teamId,
        category_id: categoryId,
        match_id: entry.matchId
      }
      STAT_KEYS.forEach(field => { row[field] = entry[field] || 0 })
      inserts.push(row)
    }
  })

  const operations = updates.map(({ id, fields }) =>
    runQuery(supabase.from('IndividualStats').update(fields).eq('id', id).select())
  )

  if (inserts.length) {
    operations.push(
      runQuery(supabase.from('IndividualStats').insert(inserts).select())
    )
  }

  const results = await Promise.all(operations)

  const wroteNothing = results.some(rows => rows.length === 0)
  if (wroteNothing) {
    throw new Error('No se pudieron guardar las estadísticas (permiso denegado)')
  }

  invalidate('getIndividualStatsByCategory')
  invalidate('getIndividualStatsByMatchId')

  return results
}

// Permite a Admin/SuperAdmin corregir o "eliminar" (poniendo amount en 0)
// una estadística individual después de guardada, sobreescribiendo el valor
// exacto en vez de sumar un delta como hace saveIndividualStatsForMatch.
export async function updateIndividualStatField(rowId, statKey, amount) {
  const result = await runQuery(
    supabase.from('IndividualStats').update({ [statKey]: amount }).eq('id', rowId).select().single(),
    'No se pudo actualizar la estadística'
  )

  invalidate('getIndividualStatsByCategory')
  invalidate('getIndividualStatsByMatchId')

  return result
}
