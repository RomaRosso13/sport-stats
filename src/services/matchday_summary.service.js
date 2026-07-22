import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { invalidate } from '../utils/queryCache'

// Llama a la Edge Function `generate-matchday-summary`, que trae los datos
// reales de la jornada (con la service_role key) y le pide a Gemini un
// borrador de crónica. No guarda nada en la base — eso lo hace
// publishMatchdaySummary una vez que el admin revisó/editó el texto.
export async function generateMatchdaySummary(matchdayId) {
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-matchday-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({ matchdayId })
  })

  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'No se pudo generar el resumen')

  return body.summary
}

export async function publishMatchdaySummary(matchdayId, summary) {
  const result = await runQuery(
    supabase.from('Matchday').update({ summary }).eq('id', matchdayId).select().single(),
    'No se pudo publicar el resumen'
  )

  invalidate('getMatchDaysByCategoryId')
  invalidate('getMatchDaysByCategoryIds')
  return result
}
