import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

// Normaliza el valor guardado en League_User.role a uno de los roles
// soportados. 'Owner' y 'Staff' son valores heredados (antes de que existieran
// roles, y antes de que Staff se renombrara a Referi) y se tratan como
// SuperAdmin/Referi respectivamente para no perder acceso a cuentas ya existentes.
function normalizeRole(role) {
  if (!role) return null

  const value = String(role).trim().toLowerCase()

  if (value === 'staff' || value === 'referi' || value === 'referee') return 'Referi'
  if (value === 'admin') return 'Admin'
  if (value === 'superadmin' || value === 'owner') return 'SuperAdmin'
  if (value === 'fotografo') return 'Fotografo'
  if (value === 'coach') return 'Coach'

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

  const memberships = await runQuery(
    supabase
      .from('League_User')
      .select('id, role, league_id')
      .eq('user_id', userRow.id)
  )

  // SuperAdmin es un rol global: solo existe un SuperAdmin en toda la app, y
  // necesita poder administrar cualquier liga, no solo aquellas donde tiene
  // una fila explícita en League_User.
  const isSuperAdmin = (memberships || []).some(m => normalizeRole(m.role) === 'SuperAdmin')
  if (isSuperAdmin) {
    return { role: 'SuperAdmin', userId: userRow.id, teamIds: [] }
  }

  const membership = (memberships || []).find(m => String(m.league_id) === String(leagueId))
  if (!membership) return null

  const role = normalizeRole(membership.role)

  // Un coach puede tener varios equipos (ej. mismas siglas en distintas
  // categorías), ligados en League_User_Team en vez de una columna escalar.
  let teamIds = []
  if (role === 'Coach') {
    const teamRows = await runQuery(
      supabase.from('League_User_Team').select('team_id').eq('league_user_id', membership.id)
    )
    teamIds = (teamRows || []).map(r => r.team_id)
  }

  return { role, userId: userRow.id, teamIds }
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

// Coaches ya ligados a uno o más equipos en esta liga, para mostrar en el
// Gestor de Equipos qué equipos ya tienen coach asignado. Devuelve un array
// con una fila por (equipo, coach) — un coach con varios equipos aparece una
// vez por cada uno.
export async function getCoachAssignmentsByLeagueId(leagueId) {
  return cached('getCoachAssignmentsByLeagueId', [leagueId], async () => {
    const coachRows = await runQuery(
      supabase
        .from('League_User')
        .select('id, user:user_id ( id, name, email )')
        .eq('league_id', leagueId)
        .eq('role', 'Coach')
    )

    if (!coachRows || !coachRows.length) return []

    const coachByLeagueUserId = {}
    coachRows.forEach(row => { coachByLeagueUserId[row.id] = row.user })

    const assignments = await runQuery(
      supabase
        .from('League_User_Team')
        .select('team_id, league_user_id')
        .in('league_user_id', coachRows.map(row => row.id))
    )

    return (assignments || []).map(a => ({
      team_id: a.team_id,
      user: coachByLeagueUserId[a.league_user_id]
    }))
  })
}

// Ids de equipo ligados a una membresía (fila de League_User) específica.
export async function getTeamIdsForLeagueUser(leagueUserId) {
  const rows = await runQuery(
    supabase.from('League_User_Team').select('team_id').eq('league_user_id', leagueUserId)
  )
  return (rows || []).map(r => r.team_id)
}

// Reemplaza el conjunto de equipos ligados a un coach: borra los que ya no
// están en `teamIds` e inserta los nuevos.
export async function setCoachTeams(leagueUserId, teamIds) {
  const current = await runQuery(
    supabase.from('League_User_Team').select('id, team_id').eq('league_user_id', leagueUserId)
  )

  const nextTeamIds = new Set((teamIds || []).map(Number))
  const currentTeamIds = new Set((current || []).map(r => r.team_id))

  const idsToRemove = (current || []).filter(r => !nextTeamIds.has(r.team_id)).map(r => r.id)
  const teamIdsToAdd = [...nextTeamIds].filter(id => !currentTeamIds.has(id))

  if (idsToRemove.length) {
    await runQuery(
      supabase.from('League_User_Team').delete().in('id', idsToRemove),
      'No se pudo actualizar los equipos del coach'
    )
  }

  if (teamIdsToAdd.length) {
    await runQuery(
      supabase.from('League_User_Team').insert(teamIdsToAdd.map(team_id => ({ league_user_id: leagueUserId, team_id }))),
      'No se pudo actualizar los equipos del coach'
    )
  }

  invalidate('getCoachAssignmentsByLeagueId')
  return [...nextTeamIds]
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
  invalidate('getCoachAssignmentsByLeagueId')
  return result
}

export async function updateLeagueMemberRole(leagueUserId, role) {
  const result = await runQuery(
    supabase.from('League_User').update({ role }).eq('id', leagueUserId).select().single(),
    'No se pudo actualizar el rol'
  )

  invalidate('getLeagueMembers')
  invalidate('getCoachAssignmentsByLeagueId')
  return result
}

