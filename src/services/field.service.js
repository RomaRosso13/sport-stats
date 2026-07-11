import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getFieldByBranchId(branchId) {
  return runQuery(
    supabase.from('Field').select('*').eq('branch_id', branchId)
  )
}

export async function createField(branchId, { name }) {
  return runQuery(
    supabase
      .from('Field')
      .insert([{ branch_id: Number(branchId), name }])
      .select()
      .single()
  )
}

export async function updateField(fieldId, { name }) {
  return runQuery(
    supabase
      .from('Field')
      .update({ name })
      .eq('id', fieldId)
      .select()
      .single()
  )
}
