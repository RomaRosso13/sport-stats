// Lógica pura (sin Supabase) para el Asistente de Torneo — separada de la
// página para poder probarla/leerla sin todo el ruido de fetch/estado de
// React. Todo recibe y regresa objetos Team completos (no solo ids) para
// que el llamador no tenga que hacer un segundo mapeo.

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Reparte equipos en `numGroups` grupos lo más parejos posible (orden
// aleatorio). Regresa un arreglo de arreglos de equipos — el índice define
// a qué grupo pertenece cada subarreglo.
export function distributeTeamsIntoGroups(teams, numGroups) {
  const shuffled = shuffle(teams)
  const groups = Array.from({ length: numGroups }, () => [])
  shuffled.forEach((team, i) => groups[i % numGroups].push(team))
  return groups
}

function roundRobinPairs(teams) {
  const pairs = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push([teams[i], teams[j]])
    }
  }
  return pairs
}

// Arma los partidos de un grupo intentando que cada equipo llegue a
// `targetPerTeam` partidos sin repetir rival; si el grupo es chico y no
// alcanzan rivales distintos para llegar a esa meta, repite enfrentamientos
// (marcados con `repeat: true`) hasta completarla.
export function generateGroupMatchups(teams, targetPerTeam) {
  if (teams.length < 2) return []

  const uniquePairs = shuffle(roundRobinPairs(teams))
  const count = new Map(teams.map(t => [t.id, 0]))
  const selected = []

  uniquePairs.forEach(([a, b]) => {
    if (count.get(a.id) < targetPerTeam && count.get(b.id) < targetPerTeam) {
      selected.push({ a, b, repeat: false })
      count.set(a.id, count.get(a.id) + 1)
      count.set(b.id, count.get(b.id) + 1)
    }
  })

  let guard = 0
  while (teams.some(t => count.get(t.id) < targetPerTeam) && guard < 300) {
    guard++
    const needMore = teams
      .filter(t => count.get(t.id) < targetPerTeam)
      .sort((x, y) => count.get(x.id) - count.get(y.id))
    if (needMore.length < 2) break // a un equipo ya no le queda con quién jugar
    const [a, b] = needMore
    selected.push({ a, b, repeat: true })
    count.set(a.id, count.get(a.id) + 1)
    count.set(b.id, count.get(b.id) + 1)
  }

  return selected
}

// A partir de los partidos de la ronda 1 (arreglo de [a, b]), arma las
// rondas siguientes (vacías, "por definir") hasta llegar a 1 solo partido.
// Sirve solo para mostrar la forma completa del bracket en la vista previa
// — las rondas después de la 1 no se guardan en la base hasta que se sepan
// los resultados (ver nota en TournamentWizard.tsx).
export function buildRoundsCascade(round1) {
  const rounds = [round1]
  let count = round1.length
  while (count > 1) {
    count = Math.ceil(count / 2)
    rounds.push(Array.from({ length: count }, () => null))
  }
  return rounds
}

export function roundLabelForDepth(totalRounds, roundIndex) {
  const fromEnd = totalRounds - roundIndex
  if (fromEnd === 1) return 'Final'
  if (fromEnd === 2) return 'Semifinal'
  if (fromEnd === 3) return 'Cuartos'
  return `Ronda ${roundIndex + 1}`
}

// Bracket combinado: todos los clasificados de todos los grupos se mezclan
// en un solo bracket, sembrado mejor-vs-peor (para no topar a los 2
// favoritos antes de la final).
export function buildCombinedBracket(divisions, perGroup) {
  const qualified = divisions.flatMap(d => d.teams.slice(0, perGroup))
  const seeded = []
  const half = Math.ceil(qualified.length / 2)
  for (let i = 0; i < half; i++) {
    seeded.push(qualified[i])
    if (qualified[qualified.length - 1 - i] !== qualified[i]) seeded.push(qualified[qualified.length - 1 - i])
  }
  const round1 = []
  for (let i = 0; i < seeded.length; i += 2) {
    if (seeded[i + 1]) round1.push([seeded[i], seeded[i + 1]])
  }
  return { round1, size: qualified.length }
}

// Cruce de grupos: `pairings` es { [divisionId]: otherDivisionId | null }.
// Cada cruce (o cada grupo sin pareja) produce su PROPIO bracket
// independiente — no se mezclan entre sí.
export function buildCrossoverBrackets(divisions, pairings, perGroup) {
  const handled = new Set()
  const brackets = []

  divisions.forEach(d => {
    if (handled.has(d.id)) return
    const dQualified = d.teams.slice(0, perGroup)
    const partnerId = pairings[d.id]
    const partner = partnerId && divisions.find(od => od.id === partnerId)

    let round1 = []
    let label = d.name
    let size = dQualified.length

    if (partner) {
      const pQualified = partner.teams.slice(0, perGroup)
      size += pQualified.length
      label = `${d.name} y ${partner.name}`
      round1 = perGroup >= 2
        ? [[dQualified[0], pQualified[1]], [pQualified[0], dQualified[1]]]
        : [[dQualified[0], pQualified[0]]]
      handled.add(partner.id)
    } else if (dQualified.length >= 2) {
      round1 = [[dQualified[0], dQualified[1]]]
    }

    handled.add(d.id)
    if (round1.length === 0) return // no hay suficientes clasificados para armar un partido

    brackets.push({ divisionId: d.id, label, size, round1 })
  })

  return brackets
}
