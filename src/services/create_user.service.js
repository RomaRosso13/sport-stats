import { supabase } from '../libs/supabase'
import { invalidate } from '../utils/queryCache'

// Única llamada fetch() directa de la app (todo lo demás usa el cliente de
// Supabase): crea una cuenta de Auth nueva + su fila en User/League_User a
// través de la Edge Function `create-user`, que es quien tiene acceso a la
// service_role key (nunca puede vivir en el cliente).
export async function createUser({ email, password, name, leagueId, role, teamIds }) {
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({ email, password, name, leagueId, role, teamIds: Array.isArray(teamIds) ? teamIds : [] })
  })

  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'No se pudo crear el usuario')

  invalidate('getLeagueMembers')
  invalidate('getCoachAssignmentsByLeagueId')
  return body
}

// Quita a un usuario de la liga a través de la Edge Function `delete-user`:
// borra su membresía (League_User) y, si esa era su única liga, también
// borra su fila en User y su cuenta de Supabase Auth por completo.
export async function deleteUserFromLeague(leagueUserId) {
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({ leagueUserId })
  })

  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'No se pudo quitar al usuario')

  invalidate('getLeagueMembers')
  invalidate('getCoachAssignmentsByLeagueId')
  return body
}
