import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { userBelongsToLeague } from './league_user.service'

export async function signInByPasswordForLeague(email, password, leagueId) {
  const data = await runQuery(
    supabase.auth.signInWithPassword({ email, password }),
    'Correo o contraseña incorrectos'
  )

  const belongs = await userBelongsToLeague(data.user.id, leagueId)

  if (!belongs) {
    await supabase.auth.signOut()
    throw new Error('No perteneces a esta liga')
  }

  return data
}

export async function signOut() {
  await runQuery(supabase.auth.signOut())
}
