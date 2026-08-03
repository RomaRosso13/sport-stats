// Normaliza los enfrentamientos previos a la perspectiva de un equipo fijo
// (localTeamId), para que en la lista el marcador siempre se lea en el mismo
// orden sin importar quién fue local en cada partido histórico.
export function calculateHeadToHead(matches, localTeamId) {
  let winsLocal = 0
  let winsVisit = 0
  let draws = 0

  const rows = matches.map(match => {
    const isLocalPerspective = String(match.local_team_id) === String(localTeamId)
    const scoreLocal = isLocalPerspective ? match.local_points : match.visit_points
    const scoreVisit = isLocalPerspective ? match.visit_points : match.local_points

    if (scoreLocal > scoreVisit) winsLocal++
    else if (scoreVisit > scoreLocal) winsVisit++
    else draws++

    return { id: match.id, date: match.date, scoreLocal, scoreVisit }
  })

  return { rows, winsLocal, winsVisit, draws }
}
