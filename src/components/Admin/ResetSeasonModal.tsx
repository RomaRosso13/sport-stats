import { useState } from 'react'
import { resetSeason } from '../../services/season.service.js'

import './ResetSeasonModal.css'

const CONFIRM_WORD = 'Acepto'

function ResetSeasonModal({ season, onClose, onReset }) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = confirmText.trim() === CONFIRM_WORD

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    try {
      setLoading(true)
      setError('')
      await resetSeason(season.id)
      onReset()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo resetear la temporada')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal reset-season-modal">
        <h3>Resetear {season.name}</h3>

        <p className="reset-season-warning">Esto borrará permanentemente:</p>
        <ul className="reset-season-list danger">
          <li>Todas las jornadas</li>
          <li>Todos los partidos y marcadores</li>
          <li>Todas las estadísticas individuales</li>
          <li>Toda la asistencia registrada</li>
        </ul>

        <p className="reset-season-warning">Se conservan:</p>
        <ul className="reset-season-list safe">
          <li>Sedes y canchas</li>
          <li>Categorías, equipos y jugadores</li>
        </ul>

        <form onSubmit={handleSubmit}>
          <label>Escribe "{CONFIRM_WORD}" para confirmar</label>
          <input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
          />

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="reset-season-confirm-btn" disabled={!canSubmit || loading}>
              {loading ? 'Reseteando...' : 'Resetear temporada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetSeasonModal
