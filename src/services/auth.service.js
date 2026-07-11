import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { getUserRoleForLeague } from './league_user.service'

export async function signInByPasswordForLeague(email, password, leagueId) {
  const data = await runQuery(
    supabase.auth.signInWithPassword({ email, password }),
    'Correo o contraseña incorrectos'
  )

  const membership = await getUserRoleForLeague(data.user.id, leagueId)

  if (!membership) {
    await supabase.auth.signOut()
    throw new Error('No perteneces a esta liga')
  }

  return { ...data, role: membership.role }
}

export async function signOut() {
  await runQuery(supabase.auth.signOut())
}
