import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

// Un solo row global (id=1), independiente de cada liga — mismo texto para
// todos los admins de todas las ligas. Solo un SuperAdmin puede editarlo
// (ver ConfigManager.tsx), sin importar en qué liga esté parado cuando lo haga.
export async function getPlatformSettings() {
  return cached('getPlatformSettings', [], () =>
    runQuery(
      supabase.from('PlatformSettings').select('*').eq('id', 1).single()
    ),
    5 * 60_000
  )
}

export async function updatePlatformReleaseNotes(releaseNotes) {
  const result = await runQuery(
    supabase
      .from('PlatformSettings')
      .update({ release_notes: releaseNotes || null, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .single(),
    'No se pudieron guardar las notas de versión'
  )

  invalidate('getPlatformSettings')
  return result
}
