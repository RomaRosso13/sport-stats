import { DEFAULT_TIEBREAKER_CONFIG } from '../constants/tiebreakerCriteria'

// Cada comparador regresa >0 si `b` debe ir antes que `a`, <0 si `a` va antes,
// 0 si no desempata (se pasa al siguiente criterio activo). `against` es el
// único donde "menos es mejor", por eso va al revés que los demás.
const CRITERIA_COMPARATORS = {
  wins: (a, b) => b.g - a.g,
  points: (a, b) => b.puntos - a.puntos,
  scored: (a, b) => b.pf - a.pf,
  against: (a, b) => a.pc - b.pc,
  sum: (a, b) => (b.pf + b.pc) - (a.pf + a.pc),
  average: (a, b) => b.average - a.average,
  headToHead: (a, b, matches) => {
    const game = matches.find(m => (
      m.status === 'Terminado' &&
      ((m.local_team.id === a.id && m.visit_team.id === b.id) ||
       (m.local_team.id === b.id && m.visit_team.id === a.id))
    ))
    if (!game) return 0

    const aIsLocal = game.local_team.id === a.id
    const aPoints = aIsLocal ? game.local_points : game.visit_points
    const bPoints = aIsLocal ? game.visit_points : game.local_points
    return bPoints - aPoints
  }
}

export function calculateTable(matches, teams = [], tiebreakerConfig = DEFAULT_TIEBREAKER_CONFIG) {
  const tabla = {}

  function ensureTeam(id, name, logo, color, divisionId) {
    if (!tabla[id]) {
      tabla[id] = {
        id,
        equipo: name,
        logo,
        color: color || null,
        division_id: divisionId ?? null,
        pj: 0,
        g: 0,
        e: 0,
        p: 0,
        pf: 0,
        pc: 0,
        difference: 0,
        average: 0,
        puntos: 0
      }
    }
    return tabla[id]
  }

  teams.forEach(team => ensureTeam(team.id, team.name, team.logo_url, team.primary_color, team.division_id))

  matches
    .filter(p => p.status === 'Terminado')
    .forEach(partido => {
      const { local_team, visit_team, local_points, visit_points } = partido

      const local = ensureTeam(local_team.id, local_team.name, local_team.logo_url, local_team.primary_color, local_team.division_id)
      const visit = ensureTeam(visit_team.id, visit_team.name, visit_team.logo_url, visit_team.primary_color, visit_team.division_id)

      local.pj += 1
      visit.pj += 1

      local.pf += local_points
      local.pc += visit_points
      visit.pf += visit_points
      visit.pc += local_points

      if (local_points > visit_points) {
        local.g += 1
        local.puntos += 2
        visit.p += 1
      } else if (visit_points > local_points) {
        visit.g += 1
        visit.puntos += 2
        local.p += 1
      } else {
        // empate
        local.e += 1
        visit.e += 1
        local.puntos += 1
        visit.puntos += 1
      }
    })

  Object.values(tabla).forEach(equipo => {
    equipo.pf = Number(equipo.pf)
    equipo.pc = Number(equipo.pc)
    equipo.pj = Number(equipo.pj)
    equipo.difference = equipo.pf - equipo.pc
    equipo.average =
    equipo.pj > 0 ? Number(((equipo.pf - equipo.pc) / equipo.pj).toFixed(2)) : 0
  })

  const activeCriteria = (tiebreakerConfig || DEFAULT_TIEBREAKER_CONFIG).filter(c => c.enabled)

  return Object.values(tabla).sort((a, b) => {
    for (const criterion of activeCriteria) {
      const comparator = CRITERIA_COMPARATORS[criterion.key]
      if (!comparator) continue

      const result = comparator(a, b, matches)
      if (result !== 0) return result
    }
    return 0
  })
}
