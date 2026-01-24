import { supabase } from '../libs/supabase'
import { userBelongsToLeague } from './league_user.service'

export async function signInByPasswordForLeague( email, password, leagueId) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password})

  if (error) {
    throw new Error('Correo o contraseña incorrectos')
  }

  console.log('Data',data)
  const belongs = await userBelongsToLeague(leagueId)
  console.log('Belongs', belongs)

  if (!belongs) {
    await supabase.auth.signOut()
    throw new Error('No perteneces a esta liga')
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

