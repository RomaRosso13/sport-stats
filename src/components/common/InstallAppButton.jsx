import { useState } from 'react'

import { useInstallPrompt } from '../../hooks/useInstallPrompt'

import './InstallAppButton.css'

// Se muestra en varios lugares (inicio, header de cada liga) para que el
// usuario pueda instalar la app sin importar si ya tiene una liga guardada
// y `/` lo mandó directo ahí, saltándose el selector.
function InstallAppButton({ className }) {
  const [showIosHelp, setShowIosHelp] = useState(false)
  const { installed, canInstall, isIos, promptInstall } = useInstallPrompt()

  if (installed || (!canInstall && !isIos)) return null

  function handleClick() {
    if (canInstall) {
      promptInstall()
    } else if (isIos) {
      setShowIosHelp(true)
    }
  }

  return (
    <div className="install-app-wrap">
      <button type="button" className={className} onClick={handleClick}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Instalar app
      </button>

      {showIosHelp && (
        <div className="install-app-tip" role="tooltip">
          Toca <strong>Compartir</strong> ⬆️ en Safari y elige <strong>"Agregar a pantalla de inicio"</strong>.
          <button
            type="button"
            className="install-app-tip-close"
            onClick={() => setShowIosHelp(false)}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default InstallAppButton
