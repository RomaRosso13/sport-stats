// Cache en memoria muy simple para evitar reconsultar Supabase cada vez que
// el usuario navega entre páginas dentro de la misma sesión del navegador.
// Se limpia solo al recargar la página (vive en memoria, no en localStorage)
// y se invalida explícitamente cada vez que algo escribe en la tabla asociada,
// para que quien acaba de guardar un cambio siempre vea el dato fresco.

const cache = new Map()
const DEFAULT_TTL = 60_000 // 1 minuto

function makeKey(name, args) {
  return `${name}:${JSON.stringify(args)}`
}

export function cached(name, args, queryFn, ttlMs = DEFAULT_TTL) {
  const key = makeKey(name, args)
  const entry = cache.get(key)
  const now = Date.now()

  if (entry && now - entry.timestamp < ttlMs) {
    return entry.promise
  }

  const promise = Promise.resolve().then(queryFn).catch(err => {
    cache.delete(key)
    throw err
  })

  cache.set(key, { promise, timestamp: now })
  return promise
}

// Borra todas las entradas cacheadas de una función (sin importar con qué
// argumentos se llamó), para que la próxima lectura traiga datos frescos.
export function invalidate(name) {
  const prefix = `${name}:`
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

export function invalidateAll() {
  cache.clear()
}
