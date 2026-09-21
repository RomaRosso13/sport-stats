import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

// El orden por sort_order (cuando existe) se aplica del lado del cliente en
// groupMatchdaysByDate, no aquí en la consulta — así esta función sigue
// funcionando igual aunque la columna sort_order no exista todavía en la
// base de datos (a diferencia de un `.order('sort_order', ...)` en la propia
// consulta, que haría fallar la petición completa con "column does not
// exist" mientras no se corra esa migración).
export async function getMatchDaysByCategoryId(categoryId) {
  return cached('getMatchDaysByCategoryId', [categoryId], () =>
    runQuery(
      supabase
        .from('Matchday')
        .select('*')
        .eq('category_id', categoryId)
        .order('date', { ascending: true })
    )
  )
}

export async function getMatchDaysByCategoryIds(categoryIds) {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
  const sortedIds = [...ids].sort()

  return cached('getMatchDaysByCategoryIds', [sortedIds], () =>
    runQuery(
      supabase
        .from('Matchday')
        .select('*')
        .in('category_id', ids)
        .order('date', { ascending: true })
    )
  )
}

// Una "jornada" es compartida por todas las categorías activas: se crea un
// renglón de Matchday por categoría (mismo nombre y fecha) para que cada
// categoría tenga su propio matchday_id al que asociar sus partidos, pero
// desde la UI se ve y se crea como una sola jornada.
export async function createMatchdayForCategories(name, date, categoryIds) {
  const payload = categoryIds.map(categoryId => ({
    name,
    date,
    category_id: categoryId
  }))

  const result = await runQuery(
    supabase
      .from('Matchday')
      .insert(payload)
      .select()
  )

  invalidate('getMatchDaysByCategoryId')
  invalidate('getMatchDaysByCategoryIds')
  return result
}

// Actualiza nombre/fecha de una jornada en TODAS las categorías a la vez
// (recibe los ids de sus renglones de Matchday, uno por categoría) para que
// se mantenga como una sola jornada consistente en toda la temporada.
export async function updateJornada(matchdayIds, { name, date }) {
  const results = await Promise.all(
    matchdayIds.map(id =>
      runQuery(
        supabase.from('Matchday').update({ name, date }).eq('id', id).select().single(),
        'No se pudo actualizar la jornada'
      )
    )
  )

  invalidate('getMatchDaysByCategoryId')
  invalidate('getMatchDaysByCategoryIds')
  return results
}

// `orderedMatchdayIdGroups`: arreglo de jornadas en el nuevo orden deseado,
// cada una como el arreglo de sus ids de Matchday (uno por categoría) — a
// TODOS los renglones de una misma jornada les toca el mismo sort_order,
// para que seguir siendo "una sola jornada" en las demás pantallas.
export async function reorderJornadas(orderedMatchdayIdGroups) {
  const updates = []

  orderedMatchdayIdGroups.forEach((matchdayIds, index) => {
    matchdayIds.forEach(id => {
      updates.push(
        runQuery(
          supabase.from('Matchday').update({ sort_order: index }).eq('id', id).select().single(),
          'No se pudo actualizar el orden de las jornadas'
        )
      )
    })
  })

  const results = await Promise.all(updates)

  invalidate('getMatchDaysByCategoryId')
  invalidate('getMatchDaysByCategoryIds')
  return results
}

// Borra una jornada completa (sus renglones de Matchday en todas las
// categorías) junto con los partidos que ya tuviera guardados y todo lo que
// dependa de esos partidos — mismo cascade y misma verificación anti-RLS-
// silenciosa que ya usan deleteTeam/resetSeason.
export async function deleteJornada(matchdayIds) {
  const matches = await runQuery(
    supabase.from('Match').select('id').in('matchday_id', matchdayIds),
    'No se pudieron leer los partidos de la jornada'
  )
  const matchIds = matches.map(m => m.id)

  if (matchIds.length > 0) {
    await runQuery(
      supabase.from('IndividualStats').delete().in('match_id', matchIds),
      'No se pudieron eliminar las estadísticas de la jornada'
    )

    await runQuery(
      supabase.from('MatchAttendance').delete().in('match_id', matchIds),
      'No se pudo eliminar la asistencia de la jornada'
    )

    await runQuery(
      supabase.from('Match').delete().in('id', matchIds),
      'No se pudieron eliminar los partidos de la jornada'
    )
  }

  const deleted = await runQuery(
    supabase.from('Matchday').delete().in('id', matchdayIds).select(),
    'No se pudo eliminar la jornada'
  )

  if (!deleted || deleted.length === 0) {
    throw new Error('No se pudo eliminar la jornada. Es posible que no tengas permisos suficientes.')
  }

  invalidate('getMatchDaysByCategoryId')
  invalidate('getMatchDaysByCategoryIds')
  invalidate('getMatchesByMatchDayIds')
  invalidate('getMatchById')
  invalidate('getIndividualStatsByCategory')
  invalidate('getIndividualStatsByMatchId')
  invalidate('getAttendanceByMatchIds')
  invalidate('getAttendanceByPlayerId')

  return deleted
}
