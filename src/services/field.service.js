import { supabase } from '../libs/supabase'

export async function getFieldByBranchId(branchId) {
  const { data, error } = await supabase
    .from('Field')
    .select('*')
    .eq('branch_id', branchId)

  if (error) throw error
  return data
}
