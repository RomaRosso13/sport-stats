import { useState } from 'react'
import { uploadDocument } from '../../services/storage.service'
import { createDocument } from '../../services/document.service.js'

import './DocumentUploadModal.css'

function DocumentUploadModal({ leagueId, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [error, setError] = useState('')

  function handleFileChange(e) {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF')
      e.target.value = ''
      return
    }

    setError('')
    setFile(selected)
    if (!name.trim()) {
      setName(selected.name.replace(/\.pdf$/i, ''))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!file) {
      setError('Selecciona un archivo PDF')
      return
    }

    if (!name.trim()) {
      setError('El nombre del documento es obligatorio')
      return
    }

    try {
      setLoading(true)
      setError('')

      setLoadingLabel('Subiendo PDF...')
      const fileUrl = await uploadDocument(file, 'reglamento')

      setLoadingLabel('Guardando...')
      const saved = await createDocument(leagueId, { name: name.trim(), fileUrl })

      onSaved(saved)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo subir el documento')
    } finally {
      setLoading(false)
      setLoadingLabel('')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Subir documento</h3>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Reglamento General 2026"
          />

          <label>Archivo PDF</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? loadingLabel : 'Subir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DocumentUploadModal
