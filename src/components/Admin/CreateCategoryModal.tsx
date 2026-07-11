import { useState } from 'react'
import { createCategory } from '../../services/category.service.js'

import './CreateCategoryModal.css'

function CreateCategoyModal({ seasonId, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setLoading(true)
      const newCategory = await createCategory(seasonId, name)
      onCreated(newCategory)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Nueva Categoría</h3>

        <form onSubmit={handleSubmit}>  
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Mixto / Femenil"
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCategoyModal
