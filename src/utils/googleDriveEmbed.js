// Google permite embeber carpetas/archivos de Drive que sean públicos
// ("cualquiera con el enlace") sin necesitar OAuth ni API key.
export function getGoogleDriveEmbedUrl(url) {
  if (!url) return null

  const folderMatch = url.match(/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/)
  if (folderMatch) return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`

  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`

  return null
}
