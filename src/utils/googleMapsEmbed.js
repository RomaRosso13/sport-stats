// Sin API key: Google permite tanto un link de búsqueda como un embed de
// solo-lectura a partir de una dirección/nombre de lugar en texto plano.
// No hay pin arrastrable (eso ya requiere la Maps JavaScript API + API key),
// pero sirve para confirmar visualmente el lugar antes de guardar.
export function buildMapsSearchUrl(query) {
  const trimmed = query?.trim()
  if (!trimmed) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`
}

export function buildMapsEmbedUrl(query) {
  const trimmed = query?.trim()
  if (!trimmed) return ''
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`
}
