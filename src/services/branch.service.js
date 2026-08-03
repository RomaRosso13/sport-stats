import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getBranchByLeagueId(leagueId) {
  return cached('getBranchByLeagueId', [leagueId], () =>
    runQuery(
      supabase.from('Branch').select('*').eq('league_id', leagueId)
    )
  )
}

export async function getBranchesWithFieldsByLeagueId(leagueId) {
  return cached('getBranchesWithFieldsByLeagueId', [leagueId], () =>
    runQuery(
      supabase
        .from('Branch')
        .select(`
          *,
          Field (
            id,
            name,
            branch_id
          )
        `)
        .eq('league_id', leagueId)
    )
  )
}

function invalidateBranchCaches() {
  invalidate('getBranchByLeagueId')
  invalidate('getBranchesWithFieldsByLeagueId')
}

export async function createBranch(leagueId, { name, mapsUrl }) {
  const result = await runQuery(
    supabase
      .from('Branch')
      .insert([{ league_id: Number(leagueId), name, maps_url: mapsUrl || null }])
      .select()
      .single()
  )

  invalidateBranchCaches()
  return result
}

export async function updateBranch(branchId, { name, mapsUrl }) {
  const result = await runQuery(
    supabase
      .from('Branch')
      .update({ name, maps_url: mapsUrl || null })
      .eq('id', branchId)
      .select()
      .single()
  )

  invalidateBranchCaches()
  return result
}

export async function deleteBranch(branchId) {
  const result = await runQuery(
    supabase.from('Branch').delete().eq('id', branchId),
    'No se pudo eliminar la sede. Asegúrate de que no tenga canchas o partidos asociados.'
  )

  invalidateBranchCaches()
  return result
}
