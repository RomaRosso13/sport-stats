const ligasMock = {
  tochero5: {
    slug: "tochero5",
    nombre: "Liga Halcones Flag",

    temporadas: {
      "sabatina-2027": {
        id: "sabatina-2027",
        nombre: "Temporada Sabatina 2027",
        modalidad: "sabatina",
        year: 2027,
        status: "active",
        categorias: {
          mixto: {
            tipo: "mixto",
            equipos: [
                {
                  id: "halcones",
                  nombre: "Halcones",
                  coach: "Carlos Méndez",
                  jugadores: [
                    { id: "h1", nombre: "Juan Pérez", posicion: "QB" },
                    { id: "h2", nombre: "Luis Gómez", posicion: "WR" },
                    { id: "h3", nombre: "Miguel Torres", posicion: "DB" }
                  ]
                },
                {
                id: "raptors",
                  nombre: "Raptors",
                  coach: "Carlos Mendoza",
                  jugadores: [
                    { id: "h1", nombre: "Juan Pérez", posicion: "QB" },
                    { id: "h2", nombre: "Luis Gómez", posicion: "WR" },
                    { id: "h3", nombre: "Miguel Torres", posicion: "DB" }
                  ]
                }
            ],
            jornadas: [
              { 
                id: 1,
                nombre: "Jornada 1",
                fecha: "2027-01-10",
                partidos: [
                  {
                    id: "m-j1-p1",
                    local: "Halcones",
                    visitante: "Raptors",
                    puntosLocal: 20,
                    puntosVisitante: 12,
                    sede: "Estadio",
                    campo: "1",
                    hour: '',
                    jugado: true
                  },
                  {
                    id: "m-j1-p2",
                    local: "Tigres",
                    visitante: "Panteras",
                    puntosLocal: 14,
                    puntosVisitante: 15,
                    sede: "Estadio",
                    campo: "2",
                    hour: '',
                    jugado: true
                  }
                ]
              },
              {
                id: 2,
                nombre: "Jornada 2",
                fecha: "2027-01-17",
                partidos: [
                  {
                    id: "m-j2-p1",
                    local: "Halcones",
                    visitante: "Tigres",
                    puntosLocal: 20,
                    puntosVisitante: 42,
                    sede: "Estadio",
                    campo: "1",
                    hour: '',
                    jugado: true
                  },
                  {
                    id: "m-j2-p2",
                    local: "Raptors",
                    visitante: "Panteras",
                    puntosLocal: 40,
                    puntosVisitante: 50,
                    sede: "Estadio",
                    campo: "2",
                    hour: '',
                    jugado: false
                  }
                ]
              }
            ]
          },

          femenil: {
            tipo: "femenil",

            equipos: [
              { id: "halcones-f", nombre: "Halcones Femenil" },
              { id: "raptors-f", nombre: "Raptors Femenil" },
              { id: "panteras-f", nombre: "Panteras Femenil" }
            ],

            jornadas: [
              {
                id: 1,
                nombre: "Jornada 1",
                fecha: "2027-01-11",
                partidos: [
                  {
                    id: "f-j1-p1",
                    local: "Halcones Femenil",
                    visitante: "Raptors Femenil",
                    puntosLocal: 18,
                    puntosVisitante: 6,
                    sede: "Estadio",
                    campo: "1",
                    hour: '',
                    jugado: true
                  }
                ]
              },
              {
                id: 2,
                nombre: "Jornada 2",
                fecha: "2027-01-18",
                partidos: [
                  {
                    id: "f-j2-p1",
                    local: "Raptors Femenil",
                    visitante: "Panteras Femenil",
                    puntosLocal: null,
                    puntosVisitante: null,
                    sede: "Estadio",
                    campo: "1",
                    hour: '',
                    jugado: false
                  }
                ]
              }
            ]
          },

          varonil: {
            tipo: "varonil",

            equipos: [
              { id: "halcones-v", nombre: "Halcones Varonil" },
              { id: "tigres-v", nombre: "Tigres Varonil" },
              { id: "tiburones-v", nombre: "Tiburones Varonil" }
            ],

            jornadas: [
              {
                id: 1,
                nombre: "Jornada 1",
                fecha: "2027-01-12",
                partidos: [
                  {
                    id: "v-j1-p1",
                    local: "Halcones Varonil",
                    visitante: "Tigres Varonil",
                    puntosLocal: 22,
                    puntosVisitante: 20,
                    sede: "Estadio",
                    campo: "2",
                    jugado: true
                  }
                ]
              },
              {
                id: 2,
                nombre: "Jornada 2",
                fecha: "2027-01-19",
                partidos: [
                  {
                    id: "v-j2-p1",
                    local: "Tiburones Varonil",
                    visitante: "Halcones Varonil",
                    puntosLocal: null,
                    puntosVisitante: null,
                    sede: "Estadio",
                    campo: "2",
                    hour: '',
                    jugado: false
                  }
                ]
              }
            ]
          }
        }
      },

      "sabatina-2026": {
        id: "sabatina-2026",
        nombre: "Temporada Sabatina 2026",
        modalidad: "sabatina",
        year: 2026,
        status: "finished",

        categorias: {
          mixto: {
            tipo: "mixto",

            equipos: [
              { id: "halcones", nombre: "Halcones" },
              { id: "raptors", nombre: "Raptors" },
              { id: "tigres", nombre: "Tigres" }
            ],

            jornadas: [
              {
                id: 1,
                nombre: "Jornada 1",
                fecha: "2026-01-08",
                partidos: [
                  {
                    id: "m26-j1-p1",
                    local: "Halcones",
                    visitante: "Raptors",
                    puntosLocal: 18,
                    puntosVisitante: 20,
                    sede: "Estadio",
                    campo: "1",
                    jugado: true
                  }
                ]
              }
            ]
          }
        }
      }
    }
  }
}

export default ligasMock
