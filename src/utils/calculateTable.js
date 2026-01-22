export function calculateTable(matches) {
  const tabla = {}
  console.log(matches)
  matches
    .filter(p => p.status === 'Terminado')
    .forEach(partido => {
      const { local_team, visit_team, local_points, visit_points } = partido
      const local = local_team.name
      const visit = visit_team.name
      const local_logo = local_team.logo_url
      const visit_logo = visit_team.logo_url

      // Inicializar equipos si no existen
      if (!tabla[local]) {
        tabla[local] = {
          equipo: local,
          logo: local_logo,
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

      if (!tabla[visit]) {
        tabla[visit] = {
          equipo: visit,
          logo: visit_logo,
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

      tabla[local].pj += 1
      tabla[visit].pj += 1

      tabla[local].pf += local_points
      tabla[local].pc += visit_points
      tabla[visit].pf += visit_points
      tabla[visit].pc += local_points

      if (local_points > visit_points) {
        tabla[local].g += 1
        tabla[local].puntos += 3
        tabla[visit].p += 1
      } else if (visit_points > local_points) {
        tabla[visit].g += 1
        tabla[visit].puntos += 3
        tabla[local].p += 1
      } else {
        // empate
        tabla[local].e += 1
        tabla[visit].e += 1
        tabla[local].puntos += 1
        tabla[visit].puntos += 1
      }
    })

  // 🔥 diferencia de puntos
  Object.values(tabla).forEach(equipo => {
    equipo.difference = equipo.pf - equipo.pc
    equipo.average = (equipo.pj / equipo.difference).toFixed(2)
  })

  // 🏆 orden final
  return Object.values(tabla).sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos
    if (b.difference !== a.difference) return b.difference - a.difference
    return b.pf - a.pf
  })
}
