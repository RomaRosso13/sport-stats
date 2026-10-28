import { useState } from 'react'
import { addTeamToFranchiseCategory, mergeTeamsIntoFranchise } from '../../services/team.service.js'

import './TeamFormModal.css'

const CATEGORY_LABELS = { Mixto: 'Mixto', Femenil: 'Femenil', Varonil: 'Varonil' }

// Si el equipo todavía no es franquicia (franchise_id null), esta misma
// acción lo convierte: se crea la Franchise a partir de su identidad actual
// y se enlaza, antes de agregarle las categorías nuevas elegidas aquí.
function AddFranchiseCategoryModal({ team, leagueId, franchiseTeams, categories, onClose, onAdded }) {
  const missing = categories.filter(c => !franchiseTeams.some(ft => String(ft.category_id) === String(c.id)))
  const [picked, setPicked] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggle(id) {
    setPicked(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (picked.length === 0) { setError('Elige al menos una categoría'); return }

    try {
      setLoading(true)
      setError('')

      let franchiseId = team.franchise_id
      if (!franchiseId) {
        const franchise = await mergeTeamsIntoFranchise(leagueId, [team.id], {
          name: team.name,
          logoUrl: team.logo_url,
          primaryColor: team.primary_color
        })
        franchiseId = franchise.id
      }

      for (const categoryId of picked) {
        await addTeamToFranchiseCategory(franchiseId, categoryId, {
          name: team.name,
          logoUrl: team.logo_url,
          primaryColor: team.primary_color
        })
      }

      onAdded()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo agregar la categoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Agregar a otra categoría</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -6, marginBottom: 14 }}>
          {team.franchise_id
            ? `${team.name} ya compite en varias categorías. ¿En qué más va a competir?`
            : `Esto convierte a ${team.name} en una franquicia — mismo roster, también compite en la(s) categoría(s) que elijas.`}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="franchise-cat-checks">
            {missing.map(c => (
              <label key={c.id} className="check-row">
                <input type="checkbox" checked={picked.includes(c.id)} onChange={() => toggle(c.id)} />
                {CATEGORY_LABELS[c.type] || c.type}
              </label>
            ))}
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Agregar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFranchiseCategoryModal
