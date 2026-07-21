import { useState } from 'react'
import { upsertJornadaLink } from '../../services/jornada_link.service.js'

import './JornadaLinkModal.css'

function JornadaLinkModal({ seasonId, jornada, existingUrl, onClose, onSaved }) {
  const [url, setUrl] = useState(existingUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (!url.trim()) {
      setError('El enlace es obligatorio')
      return
    }

    try {
      setLoading(true)
      setError('')

      const saved = await upsertJornadaLink(seasonId, jornada.date, url.trim())

      onSaved(saved)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo guardar el enlace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{existingUrl ? 'Editar enlace' : 'Agregar enlace'}</h3>
        <p className="jornada-link-modal-subtitle">{jornada.name}</p>

        <form onSubmit={handleSubmit}>
          <label>Enlace (Google Drive u otro)</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            autoFocus
          />

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JornadaLinkModal
