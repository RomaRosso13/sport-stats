import { useState } from 'react'
import { updateJornada } from '../../services/matchday.service.js'

import './EditJornadaModal.css'

function EditJornadaModal({ jornada, hasMatches, onClose, onSaved }) {
  const [name, setName] = useState(jornada.name || '')
  const [date, setDate] = useState(jornada.date || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const matchdayIds = Object.values(jornada.matchdaysByCategory).map(md => md.id)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !date) return

    try {
      setLoading(true)
      setError('')

      await updateJornada(matchdayIds, { name: name.trim(), date })

      onSaved({ ...jornada, name: name.trim(), date })
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo guardar la jornada')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Editar jornada</h3>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Jornada 5 / Cuartos de final"
          />

          <label>Fecha</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            disabled={hasMatches}
          />
          {hasMatches && (
            <p className="jornada-date-hint">
              Esta jornada ya tiene partidos guardados — la fecha no se puede cambiar para no desincronizarla de sus partidos.
            </p>
          )}

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

export default EditJornadaModal
