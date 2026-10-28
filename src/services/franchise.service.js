import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { invalidate } from '../utils/queryCache'

function invalidateFranchiseCaches() {
  invalidate('getTeamsByCategoryId')
  invalidate('getTeamsByCategoryIds')
  invalidate('getTeamById')
  invalidate('getTeamsByIds')
  invalidate('getTeamsByFranchiseIds')
}

export async function createFranchise(leagueId, { name, logoUrl, primaryColor }) {
  const result = await runQuery(
    supabase
      .from('Franchise')
      .insert([{
        league_id: Number(leagueId),
        name,
        logo_url: logoUrl || null,
        primary_color: primaryColor || null,
        active: true
      }])
      .select()
      .single(),
    'No se pudo crear la franquicia'
  )

  invalidateFranchiseCaches()
  return result
}

// El nombre/logo/color de una franquicia se guarda duplicado en cada Team
// enlazado (en vez de hacer que cada pantalla embeba Franchise), para que
// el resto de la app (Tabla, Partidos, Estadísticas...) siga leyendo
// team.name/team.logo_url exactamente como hoy, sin tener que tocar esas
// consultas. Por eso, editar la franquicia debe propagarse a todos sus Team.
export async function updateFranchise(franchiseId, { name, logoUrl, primaryColor }) {
  const result = await runQuery(
    supabase
      .from('Franchise')
      .update({ name, logo_url: logoUrl || null, primary_color: primaryColor || null })
      .eq('id', franchiseId)
      .select()
      .single(),
    'No se pudo actualizar la franquicia'
  )

  await runQuery(
    supabase
      .from('Team')
      .update({ name, logo_url: logoUrl || null, primary_color: primaryColor || null })
      .eq('franchise_id', franchiseId),
    'No se pudieron actualizar los equipos de la franquicia'
  )

  invalidateFranchiseCaches()
  return result
}
