import { useState } from 'react'
import { createField, updateField } from '../../services/field.service.js'

import './FieldFormModal.css'

function FieldFormModal({ branchId, field, onClose, onSaved }) {
  const isEditing = !!field
  const [name, setName] = useState(field?.name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre de la cancha es obligatorio')
      return
    }

    try {
      setLoading(true)
      setError('')

      const saved = isEditing
        ? await updateField(field.id, { name: name.trim() })
        : await createField(branchId, { name: name.trim() })

      onSaved(saved)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo guardar la cancha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{isEditing ? 'Editar cancha' : 'Nueva cancha'}</h3>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Campo 1"
          />

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FieldFormModal
