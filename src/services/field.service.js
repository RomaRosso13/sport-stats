import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'

export async function getFieldByBranchId(branchId) {
  return runQuery(
    supabase.from('Field').select('*').eq('branch_id', branchId)
  )
}
