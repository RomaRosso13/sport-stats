import { Link } from 'react-router-dom'

import './Footer.css'

function Footer() {
  return (
    <footer className="app-footer">
      <span className="app-footer-copy">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </span>

      <span className="app-footer-divider" aria-hidden="true">•</span>

      <Link to="/privacidad" className="app-footer-contact">
        Aviso de Privacidad
      </Link>

      <span className="app-footer-divider" aria-hidden="true">•</span>

      <Link to="/contacto" className="app-footer-contact">
        Contacto
      </Link>
    </footer>
  )
}

export default Footer
