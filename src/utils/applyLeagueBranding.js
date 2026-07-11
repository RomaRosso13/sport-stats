const DEFAULT_TITLE = 'FlagStats'
const DEFAULT_FAVICON = '/vite.svg'

function setFavicon(href) {
  let link = document.querySelector("link[rel~='icon']")

  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }

  // El <link> original declara type="image/svg+xml" para el favicon default;
  // hay que quitarlo para que el navegador no rechace un logo PNG/JPG por el
  // mismatch de tipo declarado.
  link.removeAttribute('type')
  link.href = href
}

// Actualiza el título y el favicon de la pestaña con el nombre/logo de la liga activa.
export function applyLeagueBranding(name, imageUrl) {
  document.title = name ? `${name} · FlagStats` : DEFAULT_TITLE
  setFavicon(imageUrl || DEFAULT_FAVICON)
}
