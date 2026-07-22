const DEFAULT_TITLE = 'FlagStats · Estadísticas y resultados de tu liga de flag football'
// Balón de americano: favicon de respaldo cuando la liga no tiene logo propio.
const DEFAULT_FAVICON = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏈</text></svg>"

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
