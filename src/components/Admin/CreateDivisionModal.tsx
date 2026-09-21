import { useState } from 'react'
import { createDivision } from '../../services/division.service.js'

import './CreateCategoryModal.css'

function CreateDivisionModal({ categoryId, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setLoading(true)
      const newDivision = await createDivision(categoryId, name)
      onCreated(newDivision)
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
        <h3>Nueva División</h3>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. A / B / Norte"
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

export default CreateDivisionModal
