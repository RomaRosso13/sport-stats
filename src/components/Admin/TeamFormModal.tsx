import { useState } from 'react'
import { createTeam, updateTeam } from '../../services/team.service.js'
import { compressImage } from '../../utils/compressImage'
import { uploadImage } from '../../services/storage.service'
import ImageUploadField from './ImageUploadField'

import './TeamFormModal.css'

function TeamFormModal({ categoryId, team, onClose, onSaved }) {
  const isEditing = !!team
  const [name, setName] = useState(team?.name || '')
  const [logoFile, setLogoFile] = useState(null)
  const [primaryColor, setPrimaryColor] = useState(team?.primary_color || '')
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre del equipo es obligatorio')
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
      const saved = isEditing
        ? await updateTeam(team.id, { name: name.trim(), logoUrl, primaryColor })
        : await createTeam(categoryId, { name: name.trim(), logoUrl, primaryColor })

      onSaved(saved)
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
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Halcones Rojos"
          />

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
