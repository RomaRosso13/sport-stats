import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getBranchByLeagueId(leagueId) {
  return runQuery(
    supabase.from('Branch').select('*').eq('league_id', leagueId)
  )
}

export async function getBranchesWithFieldsByLeagueId(leagueId) {
  return runQuery(
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
}

export async function createBranch(leagueId, { name }) {
  return runQuery(
    supabase
      .from('Branch')
      .insert([{ league_id: Number(leagueId), name }])
      .select()
      .single()
  )
}

export async function updateBranch(branchId, { name }) {
  return runQuery(
    supabase
      .from('Branch')
      .update({ name })
      .eq('id', branchId)
      .select()
      .single()
  )
}
