import { Link } from 'react-router-dom'

import Footer from '../components/common/Footer'

import './PrivacyNotice.css'

const LAST_UPDATED = '3 de agosto de 2026'
const CONTACT_EMAIL = 'mrosie.rose13@gmail.com'

function PrivacyNotice() {
  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <Link to="/" className="privacy-back">← Volver</Link>
      </header>

      <main className="privacy-container">
        <h1>Aviso de Privacidad</h1>
        <p className="privacy-updated">Última actualización: {LAST_UPDATED}</p>

        <p>
          <strong>Flag Stats</strong> (en adelante, "la Plataforma") es responsable del
          tratamiento de los datos personales que se recaban a través de este sitio, conforme
          a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
        </p>

        <section>
          <h2>1. ¿Qué datos personales recabamos?</h2>
          <p>Dependiendo de tu relación con la Plataforma, podemos tratar los siguientes datos:</p>
          <ul>
            <li>
              <strong>Administradores, árbitros, entrenadores y fotógrafos:</strong> nombre,
              correo electrónico y el rol que tienes asignado dentro de tu liga.
            </li>
            <li>
              <strong>Jugadores:</strong> nombre, número de camiseta, posición, fotografía (opcional),
              equipo al que pertenecen y su asistencia a los partidos.
            </li>
            <li>
              <strong>Datos de uso:</strong> resultados de partidos, estadísticas de juego y
              registros de qué cuenta capturó cada resultado, para fines de control interno de la liga.
            </li>
          </ul>
          <p>
            Los datos de los jugadores normalmente no los recaba la Plataforma directamente de
            ellos, sino que los captura el administrador o entrenador de su equipo. Si tú
            administras un equipo, es tu responsabilidad contar con el consentimiento de cada
            jugador (o de quien ejerza la patria potestad, si se trata de un menor de edad) antes
            de ingresar su información a la Plataforma.
          </p>
        </section>

        <section>
          <h2>2. Aviso especial sobre menores de edad</h2>
          <p>
            Algunas ligas o categorías que usan la Plataforma pueden incluir jugadores menores
            de edad. En esos casos, el administrador o entrenador que registra al menor debe
            contar con el consentimiento previo de su padre, madre o tutor legal para el
            tratamiento de sus datos personales, incluyendo su fotografía si decide subirla.
            Los padres o tutores pueden solicitar el acceso, corrección o eliminación de los
            datos de un menor a través de los medios de contacto señalados en este aviso.
          </p>
        </section>

        <section>
          <h2>3. ¿Para qué usamos tus datos?</h2>
          <ul>
            <li>Operar el calendario, resultados, tabla de posiciones y estadísticas de tu liga.</li>
            <li>Administrar accesos y permisos dentro de la Plataforma (quién puede capturar resultados, editar equipos, etc.).</li>
            <li>Mostrar rosters, fotos y estadísticas de jugadores dentro de las páginas públicas de tu liga.</li>
            <li>Contactar a los administradores de una liga por temas relacionados con el servicio o su membresía.</li>
            <li>Generar, mediante inteligencia artificial, un resumen breve de cada jornada a partir de los marcadores y estadísticas ya públicas del partido.</li>
          </ul>
        </section>

        <section>
          <h2>4. Transferencias y encargados del tratamiento</h2>
          <p>
            Para operar la Plataforma usamos proveedores de infraestructura que tratan datos
            personales en nuestro nombre, bajo sus propias políticas de seguridad:
          </p>
          <ul>
            <li><strong>Supabase</strong> — alojamiento de la base de datos, autenticación de cuentas y almacenamiento de archivos (fotos, documentos).</li>
            <li><strong>Google (Gemini API)</strong> — recibe los marcadores, nombres de equipos y líderes de estadísticas de una jornada ya jugada, únicamente para redactar el resumen de la crónica; no recibe datos de contacto de personas.</li>
          </ul>
          <p>
            Estos proveedores pueden almacenar información en servidores fuera de México. No
            vendemos ni compartimos tus datos personales con fines de mercadotecnia de terceros.
          </p>
        </section>

        <section>
          <h2>5. Derechos ARCO</h2>
          <p>
            Tienes derecho a Acceder, Rectificar y Cancelar tus datos personales, así como a
            Oponerte al tratamiento de los mismos (derechos ARCO), y a revocar el consentimiento
            que en su caso nos hayas otorgado. Para ejercer cualquiera de estos derechos, escríbenos a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> indicando tu nombre, la liga a
            la que perteneces y el derecho que deseas ejercer. Responderemos en un plazo razonable
            conforme a lo previsto por la ley.
          </p>
        </section>

        <section>
          <h2>6. Seguridad de tus datos</h2>
          <p>
            Aplicamos medidas técnicas y administrativas para proteger tus datos personales
            contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no
            autorizado — por ejemplo, cada liga solo puede ver y modificar su propia información,
            y el acceso a funciones administrativas está limitado según el rol de cada usuario.
          </p>
        </section>

        <section>
          <h2>7. Uso de almacenamiento local</h2>
          <p>
            La Plataforma usa el almacenamiento local de tu navegador (no cookies de rastreo de
            terceros) para mantener tu sesión iniciada y recordar preferencias como el modo claro/oscuro
            o la última liga que visitaste. No usamos esta información con fines publicitarios.
          </p>
        </section>

        <section>
          <h2>8. Cambios a este aviso</h2>
          <p>
            Podemos actualizar este Aviso de Privacidad en caso de cambios en la Plataforma o en
            la normatividad aplicable. Publicaremos cualquier actualización en esta misma página,
            junto con la fecha de última modificación.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default PrivacyNotice
