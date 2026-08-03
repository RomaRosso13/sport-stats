const SAMPLE_SIZE = 40
const BUCKET_STEP = 24

function rgbToSaturation(r, g, b) {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const l = (max + min) / 2
  if (max === min) return 0
  const d = max - min
  return d / (1 - Math.abs(2 * l - 1))
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('')
}

// Estima el color dominante "de marca" de un logo: reduce la imagen, ignora
// fondo transparente/casi blanco/casi negro y píxeles poco saturados (gris),
// agrupa el resto en cubos de color y devuelve el promedio del cubo más
// frecuente. Devuelve null si no hay ningún color útil (logo en blanco,
// gris puro, transparente, etc.) — el llamador simplemente no sugiere nada.
export function extractDominantColor(file) {
  return new Promise(resolve => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      try {
        const canvas = document.createElement('canvas')
        canvas.width = SAMPLE_SIZE
        canvas.height = SAMPLE_SIZE
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
        const buckets = new Map()

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          if (a < 200) continue
          if (r > 235 && g > 235 && b > 235) continue
          if (r < 20 && g < 20 && b < 20) continue
          if (rgbToSaturation(r, g, b) < 0.15) continue

          const key = [
            Math.round(r / BUCKET_STEP),
            Math.round(g / BUCKET_STEP),
            Math.round(b / BUCKET_STEP)
          ].join(',')

          const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 }
          bucket.count++
          bucket.r += r
          bucket.g += g
          bucket.b += b
          buckets.set(key, bucket)
        }

        let best = null
        buckets.forEach(bucket => {
          if (!best || bucket.count > best.count) best = bucket
        })

        if (!best) {
          resolve(null)
          return
        }

        resolve(toHex(best.r / best.count, best.g / best.count, best.b / best.count))
      } catch (err) {
        resolve(null)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }

    img.src = objectUrl
  })
}
