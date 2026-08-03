import { useEffect, useState } from 'react'
import { createBranch, updateBranch } from '../../services/branch.service.js'
import { buildMapsSearchUrl, buildMapsEmbedUrl } from '../../utils/googleMapsEmbed'

import './BranchFormModal.css'

function BranchFormModal({ leagueId, branch, onClose, onSaved }) {
  const isEditing = !!branch
  const [name, setName] = useState(branch?.name || '')
  const [address, setAddress] = useState('')
  const [previewQuery, setPreviewQuery] = useState('')
  const [mapsUrl, setMapsUrl] = useState(branch?.maps_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Vista previa con un pequeño retraso para no recargar el iframe en cada tecla.
  useEffect(() => {
    const timeout = setTimeout(() => setPreviewQuery(address), 500)
    return () => clearTimeout(timeout)
  }, [address])

  function handleAddressChange(value) {
    setAddress(value)
    setMapsUrl(buildMapsSearchUrl(value))
  }

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
        ? await updateBranch(branch.id, { name: name.trim(), mapsUrl: mapsUrl.trim() })
        : await createBranch(leagueId, { name: name.trim(), mapsUrl: mapsUrl.trim() })

      onSaved(saved)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo guardar la sede')
    } finally {
      setLoading(false)
    }
  }

  const embedUrl = buildMapsEmbedUrl(previewQuery)

  return (
    <div className="modal-backdrop">
      <div className="modal modal-branch">
        <h3>{isEditing ? 'Editar sede' : 'Nueva sede'}</h3>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Lindavista"
          />

          <label>Dirección o nombre del lugar</label>
          <div className="branch-address-row">
            <input
              value={address}
              onChange={e => handleAddressChange(e.target.value)}
              placeholder="Ej. Unidad Deportiva Lindavista, CDMX"
            />
            {address.trim() && (
              <a
                href={buildMapsSearchUrl(address)}
                target="_blank"
                rel="noreferrer"
                className="branch-maps-open-link"
              >
                Abrir en Maps
              </a>
            )}
          </div>

          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              className="branch-map-preview"
              title="Vista previa del mapa"
              loading="lazy"
            />
          ) : (
            isEditing && mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="branch-maps-open-link">
                Ver ubicación guardada en Maps
              </a>
            )
          )}

          <label>Enlace de Google Maps</label>
          <input
            type="url"
            value={mapsUrl}
            onChange={e => setMapsUrl(e.target.value)}
            placeholder="Se genera solo al escribir la dirección, o pega aquí un link más preciso"
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
