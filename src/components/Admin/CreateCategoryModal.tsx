import { useState } from 'react'
import { createCategory, updateCategory } from '../../services/category.service.js'

import './CreateCategoryModal.css'

function CreateCategoyModal({ seasonId, category, onClose, onCreated, onSaved }) {
  const isEditing = !!category
  const [name, setName] = useState(category?.type || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setLoading(true)
      setError('')

      const saved = isEditing
        ? await updateCategory(category.id, name.trim())
        : await createCategory(seasonId, name.trim())

      if (isEditing) {
        onSaved(saved)
      } else {
        onCreated(saved)
      }
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo guardar la categoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{isEditing ? 'Editar categoría' : 'Nueva Categoría'}</h3>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Mixto / Femenil"
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

export default CreateCategoyModal
