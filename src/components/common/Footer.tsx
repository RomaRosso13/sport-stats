import './Footer.css'

function Footer() {
  return (
    <footer className="app-footer">
      <span className="app-footer-copy">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </span>

      <span className="app-footer-divider" aria-hidden="true">•</span>

      <a href="mailto:mrosie.rose13@gmail.com" className="app-footer-contact">
        <svg className="app-footer-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 5.5A1.5 1.5 0 0 1 4 4h12a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5v-9Z" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3 5.5 10 11l7-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        mrosie.rose13@gmail.com
      </a>
    </footer>
  )
}

export default Footer
