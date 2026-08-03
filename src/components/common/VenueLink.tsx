import "./VenueLink.css"

// Nombre de la sede; si tiene enlace de Google Maps, se muestra como link
// que abre el mapa en una pestaña nueva. Sin enlace, es texto plano igual
// que antes de que esto existiera.
function VenueLink({ branch, children }: { branch: any, children?: any }) {
  if (!branch) return null

  if (!branch.maps_url) {
    return <>{children ?? branch.name}</>
  }

  return (
    <a href={branch.maps_url} target="_blank" rel="noreferrer" className="venue-link">
      <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor" aria-hidden="true">
        <path d="M10 2c-3.31 0-6 2.69-6 6 0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6Zm0 8.25A2.25 2.25 0 1 1 10 5.75a2.25 2.25 0 0 1 0 4.5Z" />
      </svg>
      {children ?? branch.name}
    </a>
  )
}

export default VenueLink
