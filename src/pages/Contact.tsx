import { Link } from 'react-router-dom'

import Footer from '../components/common/Footer'

import './Contact.css'

const CONTACT_EMAIL = 'mrosie.rose13@gmail.com'

function Contact() {
  return (
    <div className="contact-page">
      <header className="contact-header">
        <Link to="/" className="contact-back">← Volver</Link>
      </header>

      <main className="contact-container">
        <h1>Contacto</h1>
        <p>
          ¿Tienes dudas, quieres reportar un problema o necesitas ayuda con tu liga en
          <strong> Flag Stats</strong>? Escríbenos y te respondemos lo antes posible.
        </p>

        <a href={`mailto:${CONTACT_EMAIL}`} className="contact-email-btn">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 5.5A1.5 1.5 0 0 1 4 4h12a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5v-9Z" stroke="currentColor" strokeWidth="1.3" />
            <path d="M3 5.5 10 11l7-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {CONTACT_EMAIL}
        </a>
      </main>

      <Footer />
    </div>
  )
}

export default Contact
