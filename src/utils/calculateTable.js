export function calculateTable(matches, teams = []) {
  const tabla = {}

  function ensureTeam(id, name, logo) {
    if (!tabla[id]) {
      tabla[id] = {
        id,
        equipo: name,
        logo,
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

  teams.forEach(team => ensureTeam(team.id, team.name, team.logo_url))

  matches
    .filter(p => p.status === 'Terminado')
    .forEach(partido => {
      const { local_team, visit_team, local_points, visit_points } = partido

      const local = ensureTeam(local_team.id, local_team.name, local_team.logo_url)
      const visit = ensureTeam(visit_team.id, visit_team.name, visit_team.logo_url)

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


  return Object.values(tabla).sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos
    if (b.difference !== a.difference) return b.difference - a.difference
    if (b.average !== a.average) return b.average - a.average
    return b.pf - a.pf
  })

}
