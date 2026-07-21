// Quita a un usuario de una liga (borra su fila en League_User) y, si esa
// era su única liga, también borra su fila en User y su cuenta de Supabase
// Auth por completo — para no dejar cuentas huérfanas sin ningún acceso.
//
// Para desplegar (requiere tus credenciales de Supabase, no se puede hacer
// desde aquí):
//   supabase functions deploy delete-user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { leagueUserId } = await req.json()

    if (!leagueUserId) {
      return jsonResponse(400, { error: 'Falta leagueUserId' })
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

    // --- Trae la membresía a borrar, para saber su liga y su usuario ---
    const { data: targetMembership } = await adminClient
      .from('League_User')
      .select('id, league_id, user_id')
      .eq('id', leagueUserId)
      .maybeSingle()

    if (!targetMembership) {
      return jsonResponse(404, { error: 'No se encontró la membresía' })
    }

    // --- Verifica que quien llama sea Admin/SuperAdmin de ESA liga ---
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
      .eq('league_id', targetMembership.league_id)
      .eq('user_id', callerUserRow.id)
      .maybeSingle()

    const callerRole = normalizeRole(callerMembership?.role)
    if (!callerMembership || !['Admin', 'SuperAdmin'].includes(callerRole || '')) {
      return jsonResponse(403, { error: 'No tienes permiso para quitar usuarios de esta liga' })
    }

    // --- Borra la membresía de esta liga ---
    const { error: deleteMembershipErr } = await adminClient
      .from('League_User')
      .delete()
      .eq('id', leagueUserId)

    if (deleteMembershipErr) {
      return jsonResponse(500, { error: 'No se pudo quitar al usuario de la liga' })
    }

    // --- ¿Sigue perteneciendo a alguna otra liga? Si no, borra también User + Auth ---
    const { data: remaining } = await adminClient
      .from('League_User')
      .select('id')
      .eq('user_id', targetMembership.user_id)

    let accountDeleted = false

    if (!remaining || remaining.length === 0) {
      const { data: userRow } = await adminClient
        .from('User')
        .select('auth_user_id')
        .eq('id', targetMembership.user_id)
        .maybeSingle()

      await adminClient.from('User').delete().eq('id', targetMembership.user_id)

      if (userRow?.auth_user_id) {
        await adminClient.auth.admin.deleteUser(userRow.auth_user_id)
      }

      accountDeleted = true
    }

    return jsonResponse(200, { accountDeleted })
  } catch (err) {
    console.error(err)
    return jsonResponse(500, { error: 'Error inesperado quitando al usuario' })
  }
})
