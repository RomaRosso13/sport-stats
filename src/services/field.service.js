import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

export async function getFieldByBranchId(branchId) {
  return cached('getFieldByBranchId', [branchId], () =>
    runQuery(
      supabase.from('Field').select('*').eq('branch_id', branchId)
    )
  )
}

// Las canchas también vienen embebidas en getBranchesWithFieldsByLeagueId,
// así que cualquier escritura aquí invalida ese cache también.
function invalidateFieldCaches() {
  invalidate('getFieldByBranchId')
  invalidate('getBranchesWithFieldsByLeagueId')
}

export async function createField(branchId, { name }) {
  const result = await runQuery(
    supabase
      .from('Field')
      .insert([{ branch_id: Number(branchId), name }])
      .select()
      .single()
  )

  invalidateFieldCaches()
  return result
}

export async function updateField(fieldId, { name }) {
  const result = await runQuery(
    supabase
      .from('Field')
      .update({ name })
      .eq('id', fieldId)
      .select()
      .single()
  )

  invalidateFieldCaches()
  return result
}

export async function deleteField(fieldId) {
  const result = await runQuery(
    supabase.from('Field').delete().eq('id', fieldId),
    'No se pudo eliminar la cancha. Asegúrate de que no tenga partidos asociados.'
  )

  invalidateFieldCaches()
  return result
}
