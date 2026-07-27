import { supabase } from '../libs/supabase'
import { runQuery } from '../libs/supabaseQuery'
import { cached, invalidate } from '../utils/queryCache'

const ATTENDANCE_SELECT = 'id, match_id, player_id, team_id, category_id, present, updated_at'

export async function getAttendanceByMatchIds(matchIds) {
  const ids = Array.isArray(matchIds) ? matchIds : [matchIds]
  const sortedIds = [...ids].sort()

  return cached('getAttendanceByMatchIds', [sortedIds], () =>
    runQuery(
      supabase
        .from('MatchAttendance')
        .select(ATTENDANCE_SELECT)
        .in('match_id', ids)
    )
  )
}

// `present` es el valor final y absoluto de cada click (no un delta), así que
// un solo upsert basta: a diferencia de saveIndividualStatsForMatch no hay
// nada que acumular entre llamadas.
export async function setAttendance(matchId, playerId, teamId, categoryId, present) {
  const result = await runQuery(
    supabase
      .from('MatchAttendance')
      .upsert(
        {
          match_id: matchId,
          player_id: playerId,
          team_id: teamId,
          category_id: categoryId,
          present,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'match_id,player_id' }
      )
      .select(ATTENDANCE_SELECT)
      .single(),
    'No se pudo actualizar la asistencia'
  )

  invalidate('getAttendanceByMatchIds')
  return result
}
