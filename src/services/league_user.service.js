import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

// Normaliza el valor guardado en League_User.role a uno de los tres roles
// soportados. 'Owner' es un valor heredado de antes de que existieran roles
// y se trata como SuperAdmin para no perder acceso a cuentas ya existentes.
function normalizeRole(role) {
  if (!role) return null

  const value = String(role).trim().toLowerCase()

  if (value === 'staff') return 'Staff'
  if (value === 'admin') return 'Admin'
  if (value === 'superadmin' || value === 'owner') return 'SuperAdmin'

  return role
}

// Devuelve { role, userId } para el usuario autenticado en esta liga, o null
// si no pertenece. `userId` es el id interno de la tabla User (no el auth uuid),
// útil para atribuir acciones (ej. quién capturó un resultado).
// A propósito NO se cachea: es la verificación de permisos, siempre debe
// reflejar el rol más reciente (ej. si un admin te acaba de quitar el acceso).
export async function getUserRoleForLeague(authUserId, leagueId) {
  if (!authUserId || !leagueId) return null

  const userRow = await runQuery(
    supabase.from('User').select('id').eq('auth_user_id', authUserId).maybeSingle()
  )

  if (!userRow) return null

  const membership = await runQuery(
    supabase
      .from('League_User')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userRow.id)
      .limit(1)
      .maybeSingle()
  )

  if (!membership) return null

  return { role: normalizeRole(membership.role), userId: userRow.id }
}

export async function userBelongsToLeague(authUserId, leagueId) {
  const result = await getUserRoleForLeague(authUserId, leagueId)
  return !!result
}

export async function getLeagueMembers(leagueId) {
  const rows = await cached('getLeagueMembers', [leagueId], () =>
    runQuery(
      supabase
        .from('League_User')
        .select(`
          id,
          role,
          user:user_id (
            id,
            name,
            email,
            auth_user_id
          )
        `)
        .eq('league_id', leagueId)
    )
  )

  return rows.map(row => ({ ...row, role: normalizeRole(row.role) }))
}

export async function findUserByEmail(email) {
  return runQuery(
    supabase
      .from('User')
      .select('id, name, email, auth_user_id')
      .ilike('email', email.trim())
      .maybeSingle()
  )
}

export async function addLeagueMember(leagueId, userId, role) {
  const result = await runQuery(
    supabase
      .from('League_User')
      .insert([{ league_id: Number(leagueId), user_id: userId, role }])
      .select(`
        id,
        role,
        user:user_id (
          id,
          name,
          email,
          auth_user_id
        )
      `)
      .single(),
    'No se pudo agregar al usuario a la liga'
  )

  invalidate('getLeagueMembers')
  return result
}

export async function updateLeagueMemberRole(leagueUserId, role) {
  const result = await runQuery(
    supabase.from('League_User').update({ role }).eq('id', leagueUserId).select().single(),
    'No se pudo actualizar el rol'
  )

  invalidate('getLeagueMembers')
  return result
}

export async function removeLeagueMember(leagueUserId) {
  const result = await runQuery(
    supabase.from('League_User').delete().eq('id', leagueUserId),
    'No se pudo quitar al usuario de la liga'
  )

  invalidate('getLeagueMembers')
  return result
}
