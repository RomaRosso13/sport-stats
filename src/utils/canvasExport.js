export function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

// Una imagen lenta o bloqueada (logo externo, foto subida) no debe dejar el
// botón de exportar trabado en "Generando..." para siempre — si no termina
// en un tiempo razonable, se corta y se avisa en vez de colgarse en silencio.
export function withTimeout(promise, ms, message) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      value => { clearTimeout(timer); resolve(value) },
      err => { clearTimeout(timer); reject(err) }
    )
  })
}
