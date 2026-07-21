// Crea un usuario nuevo (cuenta de Supabase Auth + fila en User + fila en
// League_User) desde la app, sin exponer la service_role key al navegador.
//
// Solo puede crear usuarios con rol Fotografo, Referi o Coach — nunca
// Admin/SuperAdmin, ni de forma directa a través de este endpoint.
//
// Para desplegar (requiere tus credenciales de Supabase, no se puede hacer
// desde aquí):
//   supabase login
//   supabase link --project-ref <tu-project-ref>
//   supabase functions deploy create-user
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ROLES = ['Fotografo', 'Referi', 'Coach']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalizeRole(role: string | null | undefined) {
  if (!role) return null
  const value = String(role).trim().toLowerCase()
  if (value === 'staff' || value === 'referi' || value === 'referee') return 'Referi'
  if (value === 'admin') return 'Admin'
  if (value === 'superadmin' || value === 'owner') return 'SuperAdmin'
  if (value === 'fotografo') return 'Fotografo'
  if (value === 'coach') return 'Coach'
  return role
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  try {
    const { email, password, name, leagueId, role, teamIds } = await req.json()
    const teamIdList: number[] = Array.isArray(teamIds) ? teamIds.map(Number) : []

    if (!email || !password || !name || !leagueId || !role) {
      return jsonResponse(400, { error: 'Faltan datos obligatorios' })
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return jsonResponse(400, { error: 'Rol no permitido' })
    }

    if (password.length < 6) {
      return jsonResponse(400, { error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse(401, { error: 'No autorizado' })
    }

    // Cliente con la sesión de quien llama, solo para confirmar su identidad real.
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: callerData, error: callerErr } = await callerClient.auth.getUser()
    if (callerErr || !callerData?.user) {
      return jsonResponse(401, { error: 'No autorizado' })
    }

    // Cliente con service_role, para las operaciones privilegiadas.
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // --- Verifica que quien llama sea Admin/SuperAdmin de esta liga ---
    const { data: callerUserRow } = await adminClient
      .from('User')
      .select('id')
      .eq('auth_user_id', callerData.user.id)
      .maybeSingle()

    if (!callerUserRow) {
      return jsonResponse(403, { error: 'No autorizado' })
    }

    const { data: callerMembership } = await adminClient
      .from('League_User')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', callerUserRow.id)
      .maybeSingle()

    const callerRole = normalizeRole(callerMembership?.role)
    if (!callerMembership || !['Admin', 'SuperAdmin'].includes(callerRole || '')) {
      return jsonResponse(403, { error: 'No tienes permiso para crear usuarios en esta liga' })
    }

    // --- Si es Coach y se mandaron equipos, confirma que cada uno pertenezca a esta liga ---
    if (role === 'Coach' && teamIdList.length) {
      for (const tid of teamIdList) {
        const { data: teamCheck } = await adminClient
          .from('Team')
          .select('id, category:category_id(season:season_id(league_id))')
          .eq('id', tid)
          .maybeSingle()

        // deno-lint-ignore no-explicit-any
        const teamLeagueId = (teamCheck as any)?.category?.season?.league_id
        if (!teamCheck || teamLeagueId !== Number(leagueId)) {
          return jsonResponse(400, { error: `El equipo ${tid} no pertenece a esta liga` })
        }
      }
    }

    // --- Crea la cuenta de Auth ---
    const { data: newAuthUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createErr || !newAuthUser?.user) {
      return jsonResponse(400, { error: createErr?.message || 'No se pudo crear la cuenta' })
    }

    // --- Inserta la fila en User ---
    const { data: newUserRow, error: userInsertErr } = await adminClient
      .from('User')
      .insert([{ name, email, auth_user_id: newAuthUser.user.id }])
      .select()
      .single()

    if (userInsertErr || !newUserRow) {
      await adminClient.auth.admin.deleteUser(newAuthUser.user.id)
      return jsonResponse(500, { error: 'No se pudo crear el usuario' })
    }

    // --- Inserta la fila en League_User ---
    const { data: newMembership, error: membershipErr } = await adminClient
      .from('League_User')
      .insert([{
        league_id: Number(leagueId),
        user_id: newUserRow.id,
        role,
        team_id: null,
      }])
      .select()
      .single()

    if (membershipErr || !newMembership) {
      await adminClient.from('User').delete().eq('id', newUserRow.id)
      await adminClient.auth.admin.deleteUser(newAuthUser.user.id)
      return jsonResponse(500, { error: 'No se pudo asignar el rol al usuario' })
    }

    // --- Si es Coach, liga sus equipos en la tabla de relación ---
    if (role === 'Coach' && teamIdList.length) {
      const { error: teamsInsertErr } = await adminClient
        .from('League_User_Team')
        .insert(teamIdList.map((team_id) => ({ league_user_id: newMembership.id, team_id })))

      if (teamsInsertErr) {
        await adminClient.from('League_User').delete().eq('id', newMembership.id)
        await adminClient.from('User').delete().eq('id', newUserRow.id)
        await adminClient.auth.admin.deleteUser(newAuthUser.user.id)
        return jsonResponse(500, { error: 'No se pudo ligar los equipos al usuario' })
      }
    }

    return jsonResponse(200, { user: newUserRow, membership: newMembership, teamIds: teamIdList })
  } catch (err) {
    console.error(err)
    return jsonResponse(500, { error: 'Error inesperado creando el usuario' })
  }
})
