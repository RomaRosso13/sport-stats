import { useState } from 'react'
import { createPlayer, updatePlayer } from '../../services/player.service.js'
import { compressImage } from '../../utils/compressImage'
import { uploadImage } from '../../services/storage.service'
import ImageUploadField from './ImageUploadField'

import './TeamFormModal.css'

function PlayerFormModal({ teamId, player, onClose, onSaved }) {
  const isEditing = !!player
  const [name, setName] = useState(player?.name || '')
  const [number, setNumber] = useState(player?.number ?? '')
  const [position, setPosition] = useState(player?.position || '')
  const [photoFile, setPhotoFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre del jugador es obligatorio')
      return
    }

    try {
      setLoading(true)
      setError('')

      let imageUrl = player?.image_url || ''

      if (photoFile) {
        setLoadingLabel('Optimizando imagen...')
        const compressed = await compressImage(photoFile, { maxWidth: 400, maxHeight: 400 })

        setLoadingLabel('Subiendo imagen...')
        imageUrl = await uploadImage(compressed, 'players')
      }

      setLoadingLabel('Guardando...')
      const fields = {
        name: name.trim(),
        number,
        position: position.trim(),
        imageUrl
      }

      const saved = isEditing
        ? await updatePlayer(player.id, { ...fields, active: player.active })
        : await createPlayer(teamId, fields)

      onSaved(saved)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo guardar el jugador')
    } finally {
      setLoading(false)
      setLoadingLabel('')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{isEditing ? 'Editar jugador' : 'Nuevo jugador'}</h3>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Juan Pérez"
          />

          <label>Número</label>
          <input
            type="number"
            value={number}
            onChange={e => setNumber(e.target.value)}
            placeholder="Ej. 12"
          />

          <label>Posición</label>
          <input
            value={position}
            onChange={e => setPosition(e.target.value)}
            placeholder="Ej. QB, RB, WR..."
          />

          <ImageUploadField
            label="Foto del jugador"
            currentUrl={player?.image_url}
            onFileSelected={setPhotoFile}
          />

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

export default PlayerFormModal
