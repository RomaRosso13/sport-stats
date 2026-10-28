// Catálogo fijo de módulos de la página de Inicio. `key` es lo único que se
// persiste (en League.home_modules_config, como arreglo ordenado de
// { key, enabled }) — el resto es solo para la UI de Configuración General
// y para el motor de layout de Home.tsx.
//
// `size` determina cómo se acomoda cada módulo:
//  - 'full': ocupa toda la fila por sí solo (Líderes de la Temporada).
//  - 'main': bloque principal (Tabla, Cuadro de Eliminación, Banner) — puede
//    ir solo (estirándose a todo el alto disponible) o acompañado de hasta
//    2 módulos 'side' que estén justo después de él en el orden.
//  - 'side': se acomoda junto al módulo 'main' que lo preceda en el orden,
//    o en su propia fila si no hay ninguno justo antes.
export const HOME_MODULES = [
  { key: 'stats', label: 'Líderes de la Temporada', size: 'full' },
  { key: 'standings', label: 'Tabla de Posiciones', size: 'main' },
  { key: 'bracket', label: 'Cuadro de Eliminación', size: 'main' },
  { key: 'banner', label: 'Banner Destacado', size: 'main' },
  { key: 'results', label: 'Resultados Recientes', size: 'side' },
  { key: 'upcoming', label: 'Próximos Partidos', size: 'side' }
]

export const HOME_MODULE_LABELS = Object.fromEntries(HOME_MODULES.map(m => [m.key, m.label]))
export const HOME_MODULE_SIZES = Object.fromEntries(HOME_MODULES.map(m => [m.key, m.size]))

// Config de referencia que se le muestra al admin la primera vez que entra a
// configurar sus módulos (antes de guardar nada), según League.format. Una
// liga normal mantiene el layout de siempre (Resultados y Próximos activos,
// Cuadro de Eliminación y Banner apagados). Un torneo relámpago (1-3 días)
// arranca con el Cuadro de Eliminación como protagonista, antes que la tabla
// de grupos.
const DEFAULT_HOME_MODULES_CONFIG_LIGA = [
  { key: 'stats', enabled: true },
  { key: 'standings', enabled: true },
  { key: 'results', enabled: true },
  { key: 'upcoming', enabled: true },
  { key: 'bracket', enabled: false },
  { key: 'banner', enabled: false }
]

const DEFAULT_HOME_MODULES_CONFIG_TORNEO = [
  { key: 'stats', enabled: true },
  { key: 'bracket', enabled: true },
  { key: 'upcoming', enabled: true },
  { key: 'standings', enabled: true },
  { key: 'results', enabled: false },
  { key: 'banner', enabled: false }
]

export function getDefaultHomeModulesConfig(format) {
  return format === 'torneo' ? DEFAULT_HOME_MODULES_CONFIG_TORNEO : DEFAULT_HOME_MODULES_CONFIG_LIGA
}

// Si una liga ya tenía guardada su configuración de antes de que existiera
// un módulo nuevo (ej. se agregó "bracket" después), ese módulo nuevo no
// aparece en su arreglo guardado — sin esto, simplemente no se vería en la
// lista de Configuración General. Lo agrega al final, desactivado, sin
// tocar el orden/activación de lo que la liga ya había configurado. También
// descarta cualquier key guardada que ya no exista en el catálogo actual.
export function reconcileHomeModulesConfig(config) {
  const validKeys = new Set(HOME_MODULES.map(m => m.key))
  const existing = config.filter(m => validKeys.has(m.key))
  const existingKeys = new Set(existing.map(m => m.key))
  const missing = HOME_MODULES.filter(m => !existingKeys.has(m.key)).map(m => ({ key: m.key, enabled: false }))
  return [...existing, ...missing]
}
