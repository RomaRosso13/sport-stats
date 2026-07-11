import { useState } from 'react'
import { createBranch, updateBranch } from '../../services/branch.service.js'

import './BranchFormModal.css'

function BranchFormModal({ leagueId, branch, onClose, onSaved }) {
  const isEditing = !!branch
  const [name, setName] = useState(branch?.name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre de la sede es obligatorio')
      return
    }

    try {
      setLoading(true)
      setError('')

      const saved = isEditing
        ? await updateBranch(branch.id, { name: name.trim() })
        : await createBranch(leagueId, { name: name.trim() })

      onSaved(saved)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo guardar la sede')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{isEditing ? 'Editar sede' : 'Nueva sede'}</h3>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Lindavista"
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

export default BranchFormModal
