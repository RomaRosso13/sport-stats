import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getIndividualStatsByCategory(categoryId) {
  return runQuery(
    supabase
      .from('IndividualStats')
      .select(`
        *,
        player:player_id (
          id,
          name,
          number,
          image_url
        ),
        team:team_id (
          id,
          name
        )
      `)
      .eq('category_id', categoryId)
  )
}

const STAT_FIELDS = ['touchdown', 'touchdown_pass', 'sacks', 'interceptions']

// `entries`: [{ playerId, teamId, touchdown, touchdown_pass, sacks, interceptions }]
// Each entry is a DELTA to add on top of the player's existing totals for the category,
// since IndividualStats stores one cumulative row per player per category (no per-match record).
export async function addIndividualStatsDeltas(categoryId, entries) {
  const withChanges = entries.filter(entry =>
    STAT_FIELDS.some(field => entry[field])
  )

  if (!withChanges.length) return []

  const playerIds = withChanges.map(entry => entry.playerId)

  const existingRows = await runQuery(
    supabase
      .from('IndividualStats')
      .select('*')
      .eq('category_id', categoryId)
      .in('player_id', playerIds)
  )

  const existingByPlayerId = {}
  existingRows.forEach(row => { existingByPlayerId[row.player_id] = row })

  const updates = []
  const inserts = []

  withChanges.forEach(entry => {
    const existing = existingByPlayerId[entry.playerId]

    if (existing) {
      const fields = {}
      STAT_FIELDS.forEach(field => {
        fields[field] = (existing[field] || 0) + (entry[field] || 0)
      })
      updates.push({ id: existing.id, fields })
    } else {
      const row = {
        player_id: entry.playerId,
        team_id: entry.teamId,
        category_id: categoryId
      }
      STAT_FIELDS.forEach(field => { row[field] = entry[field] || 0 })
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

  return results
}
