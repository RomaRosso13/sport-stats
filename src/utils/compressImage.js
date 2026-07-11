const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

// Redimensiona y recomprime una imagen en el navegador (canvas) antes de subirla.
// PNG se conserva como PNG (sin pérdida, pero más chico al reducir dimensiones).
// Cualquier otro formato soportado se reencoda como JPEG con compresión con pérdida.
export function compressImage(file, { maxWidth = 500, maxHeight = 500, quality = 0.82 } = {}) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Promise.reject(new Error('Solo se aceptan imágenes PNG o JPG'))
  }

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('No se pudo procesar la imagen'))
            return
          }
          resolve(blob)
        },
        outputType,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No se pudo leer la imagen'))
    }

    img.src = objectUrl
  })
}
