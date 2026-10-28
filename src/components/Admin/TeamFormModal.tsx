import { useState } from 'react'
import { createTeam, updateTeam, createFranchiseTeams } from '../../services/team.service.js'
import { compressImage } from '../../utils/compressImage'
import { uploadImage } from '../../services/storage.service'
import ImageUploadField from './ImageUploadField'

import './TeamFormModal.css'

const CATEGORY_LABELS = { Mixto: 'Mixto', Femenil: 'Femenil', Varonil: 'Varonil' }

// `categories`/`leagueId` solo se usan al CREAR (no al editar) — convertir un
// equipo ya existente en franquicia o fusionarlo con otros son acciones
// aparte (desde el roster), para no mezclar demasiado en un solo formulario.
function TeamFormModal({ categoryId, categories = [], leagueId = null, team, onClose, onSaved }) {
  const isEditing = !!team
  const [kind, setKind] = useState('normal')
  const [name, setName] = useState(team?.name || '')
  const [logoFile, setLogoFile] = useState(null)
  const [primaryColor, setPrimaryColor] = useState(team?.primary_color || '')
  const [franchiseCategoryIds, setFranchiseCategoryIds] = useState([categoryId])
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [error, setError] = useState('')

  function toggleFranchiseCategory(id) {
    setFranchiseCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre del equipo es obligatorio')
      return
    }
    if (!isEditing && kind === 'franquicia' && franchiseCategoryIds.length === 0) {
      setError('Elige al menos una categoría')
      return
    }

    try {
      setLoading(true)
      setError('')

      let logoUrl = team?.logo_url || ''

      if (logoFile) {
        setLoadingLabel('Optimizando imagen...')
        const compressed = await compressImage(logoFile, { maxWidth: 500, maxHeight: 500 })

        setLoadingLabel('Subiendo imagen...')
        logoUrl = await uploadImage(compressed, 'teams')
      }

      setLoadingLabel('Guardando...')

      if (isEditing) {
        const saved = await updateTeam(team.id, { name: name.trim(), logoUrl, primaryColor })
        onSaved(saved)
      } else if (kind === 'franquicia') {
        const { franchise, teams } = await createFranchiseTeams(
          leagueId,
          { name: name.trim(), logoUrl, primaryColor },
          franchiseCategoryIds
        )
        onSaved({ franchise, teams })
      } else {
        const saved = await createTeam(categoryId, { name: name.trim(), logoUrl, primaryColor })
        onSaved(saved)
      }

      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo guardar el equipo')
    } finally {
      setLoading(false)
      setLoadingLabel('')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{isEditing ? 'Editar equipo' : 'Nuevo equipo'}</h3>

        <form onSubmit={handleSubmit}>
          {!isEditing && (
            <div className="kind-pick">
              <div className={`kind-opt ${kind === 'normal' ? 'active' : ''}`} onClick={() => setKind('normal')}>
                <div className="k-title">⚽ Equipo normal</div>
                <div className="k-desc">Compite en una sola categoría.</div>
              </div>
              <div className={`kind-opt ${kind === 'franquicia' ? 'active' : ''}`} onClick={() => setKind('franquicia')}>
                <div className="k-title">🔗 Franquicia</div>
                <div className="k-desc">Un roster, varias categorías a la vez.</div>
              </div>
            </div>
          )}

          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Halcones Rojos"
          />

          {!isEditing && kind === 'franquicia' && (
            <>
              <label>¿En qué categorías compite?</label>
              <div className="franchise-cat-checks">
                {categories.map(cat => (
                  <label key={cat.id} className="check-row">
                    <input
                      type="checkbox"
                      checked={franchiseCategoryIds.includes(cat.id)}
                      onChange={() => toggleFranchiseCategory(cat.id)}
                    />
                    {CATEGORY_LABELS[cat.type] || cat.type}
                  </label>
                ))}
              </div>
            </>
          )}

          <ImageUploadField
            label="Logo del equipo"
            currentUrl={team?.logo_url}
            onFileSelected={setLogoFile}
            onColorDetected={setPrimaryColor}
          />

          <label>Color del equipo</label>
          <div className="team-color-field">
            <input
              type="color"
              value={primaryColor || '#2563eb'}
              onChange={e => setPrimaryColor(e.target.value)}
            />
            <span className="team-color-hint">Se detecta solo al subir el logo — puedes cambiarlo</span>
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? loadingLabel : isEditing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeamFormModal
