import { useState } from 'react'
import { createSeason } from '../../services/season.service'

import './CreateSeasonModal.css'

function CreateSeasonModal({ leagueId, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setLoading(true)
      console.log('Name', name)
      const newSeason = await createSeason(leagueId, name)
      onCreated(newSeason)
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
        <h3>Nueva temporada</h3>

        <form onSubmit={handleSubmit}>  
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Clausura 2026"
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

export default CreateSeasonModal
