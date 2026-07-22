// Genera (con Gemini, free tier) un borrador de crónica en español para una
// jornada ya jugada, a partir de sus marcadores y líderes de estadísticas
// reales. No escribe nada en la base — el frontend decide cuándo publicarlo
// (ver `publishMatchdaySummary` en src/services/matchday_summary.service.js).
//
// Para desplegar (requiere tus credenciales de Supabase, no se puede hacer
// desde aquí):
//   supabase functions deploy generate-matchday-summary
//   supabase secrets set GEMINI_API_KEY=<tu-api-key-de-Google-AI-Studio>

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STAT_LABELS: Record<string, string> = {
  touchdown: 'touchdowns',
  touchdown_pass: 'pases de touchdown',
  sacks: 'sacks',
  interceptions: 'intercepciones',
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!

  try {
    const { matchdayId } = await req.json()
    if (!matchdayId) {
      return jsonResponse(400, { error: 'Falta matchdayId' })
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

    // --- Trae la jornada y resuelve la liga dueña ---
    // deno-lint-ignore no-explicit-any
    const { data: matchday } = await adminClient
      .from('Matchday')
      .select('id, name, date, category:category_id(season:season_id(league_id))')
      .eq('id', matchdayId)
      .maybeSingle()

    // deno-lint-ignore no-explicit-any
    const leagueId = (matchday as any)?.category?.season?.league_id
    if (!matchday || !leagueId) {
      return jsonResponse(404, { error: 'No se encontró la jornada' })
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
      .eq('league_id', leagueId)
      .eq('user_id', callerUserRow.id)
      .maybeSingle()

    const callerRole = normalizeRole(callerMembership?.role)
    if (!callerMembership || !['Admin', 'SuperAdmin'].includes(callerRole || '')) {
      return jsonResponse(403, { error: 'No tienes permiso para generar el resumen de esta liga' })
    }

    // --- Trae los partidos de la jornada, con nombres de equipo ---
    const { data: matches } = await adminClient
      .from('Match')
      .select('id, local_points, visit_points, status, local_team:local_team_id(name), visit_team:visit_team_id(name)')
      .eq('matchday_id', matchdayId)

    if (!matches || matches.length === 0) {
      return jsonResponse(400, { error: 'Esta jornada no tiene partidos' })
    }

    if (matches.some((m) => m.status !== 'Terminado')) {
      return jsonResponse(400, { error: 'Todavía hay partidos sin terminar en esta jornada' })
    }

    // --- Trae las estadísticas individuales de esos partidos ---
    const matchIds = matches.map((m) => m.id)
    const { data: stats } = await adminClient
      .from('IndividualStats')
      .select('touchdown, touchdown_pass, sacks, interceptions, player:player_id(name), team:team_id(name)')
      .in('match_id', matchIds)

    // --- Arma el resumen de datos para el prompt ---
    // deno-lint-ignore no-explicit-any
    const scoresText = matches
      .map((m: any) =>
        `${m.local_team?.name ?? 'Local'} ${m.local_points ?? 0} - ${m.visit_points ?? 0} ${m.visit_team?.name ?? 'Visitante'}`
      )
      .join('\n')

    const leadersText = Object.entries(STAT_LABELS)
      .map(([key, label]) => {
        const top = (stats || [])
          // deno-lint-ignore no-explicit-any
          .filter((s: any) => (s[key] || 0) > 0)
          .sort((a: any, b: any) => (b[key] || 0) - (a[key] || 0))
          .slice(0, 3)
          .map((s: any) => `${s.player?.name ?? 'Jugador'} (${s.team?.name ?? ''}) con ${s[key]}`)

        return top.length ? `Líderes de ${label}: ${top.join(', ')}.` : null
      })
      .filter(Boolean)
      .join('\n')

    const prompt = `Eres cronista deportivo de una liga de flag football. Escribe un resumen breve (máximo 120 palabras), en español, con tono ameno y cercano (no muy formal ni robótico), de la jornada "${matchday.name}" del ${matchday.date}. Usa SOLO los datos reales de abajo, no inventes marcadores, equipos ni jugadores que no estén ahí.

Marcadores:
${scoresText}

${leadersText || 'No hay líderes de estadísticas individuales capturados para esta jornada.'}

Responde solo con el párrafo de la crónica, sin encabezados ni firma.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    )

    const geminiData = await geminiRes.json()

    if (!geminiRes.ok) {
      console.error('Gemini error:', geminiData)
      return jsonResponse(502, { error: 'No se pudo generar el resumen con IA' })
    }

    const summary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!summary) {
      return jsonResponse(502, { error: 'La IA no devolvió texto' })
    }

    return jsonResponse(200, { summary })
  } catch (err) {
    console.error(err)
    return jsonResponse(500, { error: 'Error inesperado generando el resumen' })
  }
})
