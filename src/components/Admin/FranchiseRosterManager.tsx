import { useState } from 'react'

import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'

import {
  createPlayer,
  updatePlayersByPersonKey,
  setPlayersActiveByPersonKey,
  deletePlayer,
  deletePlayersByPersonKey
} from '../../services/player.service.js'
import { compressImage } from '../../utils/compressImage'
import { uploadImage } from '../../services/storage.service'
import ImageUploadField from './ImageUploadField'

import './PlayerRosterManager.css'
import './FranchiseRosterManager.css'
import './TeamFormModal.css'

const CATEGORY_LABELS = { Mixto: 'Mixto', Femenil: 'Femenil', Varonil: 'Varonil' }

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || '?'
}

function RosterAvatar({ imageUrl, name }) {
  const [imageFailed, setImageFailed] = useState(false)
  if (imageUrl && !imageFailed) {
    return <img src={imageUrl} alt={name} className="roster-photo" loading="lazy" onError={() => setImageFailed(true)} />
  }
  return <div className="roster-avatar">{getInitial(name)}</div>
}

// Agrupa las filas de Player (una por categoría) en un solo renglón por
// persona (person_key), con la lista de categorías en las que ya está
// etiquetada.
function groupByPerson(players, franchiseTeams) {
  const teamToCategory = {}
  franchiseTeams.forEach(ft => { teamToCategory[ft.id] = ft.category_id })

  const groups: Record<string, any> = {}
  players.forEach(p => {
    const key = p.person_key
    if (!groups[key]) {
      groups[key] = { personKey: key, name: p.name, number: p.number, position: p.position, image_url: p.image_url, active: p.active, rows: [] }
    }
    groups[key].rows.push({ playerId: p.id, teamId: p.team_id, categoryId: teamToCategory[p.team_id] })
  })
  return Object.values(groups)
}

function FranchiseRosterManager({ team, franchiseTeams, categories, players, loading, onPlayersChanged, onAddCategory }) {
  const confirm = useConfirm()
  const toast = useToast()
  const [rosterFilter, setRosterFilter] = useState('todos')
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)

  const franchiseCategories = franchiseTeams
    .map(ft => categories.find(c => c.id === ft.category_id))
    .filter(Boolean)

  const grouped = groupByPerson(players, franchiseTeams)
  const sorted = [...grouped].sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity))

  const visible = rosterFilter === 'todos'
    ? sorted
    : sorted.filter(p => p.rows.some(r => String(r.categoryId) === String(rosterFilter)))

  async function toggleCategory(person, categoryId) {
    const existingRow = person.rows.find(r => String(r.categoryId) === String(categoryId))

    if (existingRow) {
      if (person.rows.length === 1) {
        toast.error('Debe jugar al menos una categoría')
        return
      }
      try {
        await deletePlayer(existingRow.playerId)
        onPlayersChanged(players.filter(p => p.id !== existingRow.playerId))
      } catch (err) {
        console.error(err)
        toast.error('No se pudo quitar la categoría')
      }
      return
    }

    const targetTeam = franchiseTeams.find(ft => String(ft.category_id) === String(categoryId))
    if (!targetTeam) return

    try {
      const created = await createPlayer(targetTeam.id, {
        name: person.name,
        number: person.number,
        position: person.position,
        imageUrl: person.image_url,
        personKey: person.personKey
      })
      onPlayersChanged([...players, created])
    } catch (err) {
      console.error(err)
      toast.error('No se pudo agregar la categoría')
    }
  }

  async function handleToggleActive(person) {
    try {
      const updated = await setPlayersActiveByPersonKey(person.personKey, !person.active)
      const updatedIds = new Set(updated.map(u => u.id))
      onPlayersChanged(players.map(p => updatedIds.has(p.id) ? { ...p, active: !person.active } : p))
    } catch (err) {
      console.error(err)
      toast.error('No se pudo actualizar el estado del jugador')
    }
  }

  async function handleDelete(person) {
    const ok = await confirm({
      message: `¿Eliminar a "${person.name}"? Se borrará de todas las categorías en las que juega, junto con sus estadísticas y asistencia. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true
    })
    if (!ok) return

    try {
      await deletePlayersByPersonKey(person.personKey)
      onPlayersChanged(players.filter(p => p.person_key !== person.personKey))
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo eliminar el jugador')
    }
  }

  return (
    <section className="roster-manager">
      <div className="section-header">
        <h3>Jugadores – {team.name} <span className="franchise-roster-tag">· roster compartido</span></h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {onAddCategory && (
            <button className="primary-btn" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }} onClick={onAddCategory}>
              🔗 Agregar a otra categoría
            </button>
          )}
          <button className="primary-btn" onClick={() => { setEditingPerson(null); setShowPlayerModal(true) }}>
            + Nuevo jugador
          </button>
        </div>
      </div>

      <p className="franchise-roster-hint">Haz clic en los chips de categoría de cada jugador para activar o desactivar en cuál juega.</p>

      <div className="franchise-roster-filters">
        <button className={`franchise-filter-pill ${rosterFilter === 'todos' ? 'active' : ''}`} onClick={() => setRosterFilter('todos')}>Todos</button>
        {franchiseCategories.map(c => (
          <button key={c.id} className={`franchise-filter-pill ${String(rosterFilter) === String(c.id) ? 'active' : ''}`} onClick={() => setRosterFilter(c.id)}>
            {CATEGORY_LABELS[c.type] || c.type}
          </button>
        ))}
      </div>

      {!loading && visible.length === 0 ? (
        <p className="empty-state">Nadie etiquetado para esta categoría todavía</p>
      ) : (
        <div className="roster-list">
          {visible.map(person => (
            <div key={person.personKey} className={`roster-row ${person.active ? '' : 'inactive'}`}>
              <div className="roster-main">
                <RosterAvatar imageUrl={person.image_url} name={person.name} />
                <span className="roster-number">{person.number != null ? `#${person.number}` : '—'}</span>
                <span className="roster-name">{person.name}</span>
                {person.position && <span className="roster-position">{person.position}</span>}
                {!person.active && <span className="roster-inactive-tag">Inactivo</span>}
              </div>

              <div className="franchise-roster-tags">
                {franchiseCategories.map(c => {
                  const on = person.rows.some(r => String(r.categoryId) === String(c.id))
                  return (
                    <span
                      key={c.id}
                      className={`badge badge-toggle badge-cat ${(c.type || '').toLowerCase()} ${on ? '' : 'off'}`}
                      onClick={() => toggleCategory(person, c.id)}
                    >
                      <span className="badge-ic">{on ? '✓' : ''}</span>
                      {CATEGORY_LABELS[c.type] || c.type}
                    </span>
                  )
                })}
              </div>

              <div className="roster-actions">
                <button type="button" onClick={() => { setEditingPerson(person); setShowPlayerModal(true) }}>Editar</button>
                <button type="button" className={person.active ? 'deactivate-btn' : 'activate-btn'} onClick={() => handleToggleActive(person)}>
                  {person.active ? 'Desactivar' : 'Activar'}
                </button>
                <button type="button" className="delete-btn" onClick={() => handleDelete(person)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPlayerModal && (
        <FranchisePlayerFormModal
          franchiseTeams={franchiseTeams}
          franchiseCategories={franchiseCategories}
          person={editingPerson}
          players={players}
          onClose={() => setShowPlayerModal(false)}
          onSaved={onPlayersChanged}
        />
      )}
    </section>
  )
}

// Modal de alta/edición de una persona del roster compartido. Al crear, se
// elige en qué categorías juega (mínimo 1) y se crea una fila de Player por
// cada una, todas con el mismo person_key. Al editar, solo se tocan los
// datos del perfil (nombre/número/posición/foto) — las categorías se tocan
// desde los chips de la lista, no aquí.
function FranchisePlayerFormModal({ franchiseTeams, franchiseCategories, person, players, onClose, onSaved }) {
  const isEditing = !!person
  const [name, setName] = useState(person?.name || '')
  const [number, setNumber] = useState(person?.number ?? '')
  const [position, setPosition] = useState(person?.position || '')
  const [photoFile, setPhotoFile] = useState(null)
  const [categoryIds, setCategoryIds] = useState(
    isEditing ? person.rows.map(r => r.categoryId) : (franchiseCategories[0] ? [franchiseCategories[0].id] : [])
  )
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [error, setError] = useState('')

  function toggleCat(id) {
    setCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre del jugador es obligatorio'); return }
    if (!isEditing && categoryIds.length === 0) { setError('Elige al menos una categoría'); return }

    try {
      setLoading(true)
      setError('')

      let imageUrl = person?.image_url || ''
      if (photoFile) {
        setLoadingLabel('Optimizando imagen...')
        const compressed = await compressImage(photoFile, { maxWidth: 400, maxHeight: 400 })
        setLoadingLabel('Subiendo imagen...')
        imageUrl = await uploadImage(compressed, 'players')
      }

      setLoadingLabel('Guardando...')

      if (isEditing) {
        const updated = await updatePlayersByPersonKey(person.personKey, { name: name.trim(), number, position: position.trim(), imageUrl })
        const updatedIds = new Set(updated.map(u => u.id))
        onSaved(players.map(p => updatedIds.has(p.id) ? updated.find(u => u.id === p.id) : p))
      } else {
        const personKey = crypto.randomUUID()
        const created = []
        for (const categoryId of categoryIds) {
          const targetTeam = franchiseTeams.find(ft => String(ft.category_id) === String(categoryId))
          if (!targetTeam) continue
          const row = await createPlayer(targetTeam.id, { name: name.trim(), number, position: position.trim(), imageUrl, personKey })
          created.push(row)
        }
        onSaved([...players, ...created])
      }

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
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Juan Pérez" />

          <label>Número</label>
          <input type="number" value={number} onChange={e => setNumber(e.target.value)} placeholder="Ej. 12" />

          <label>Posición</label>
          <input value={position} onChange={e => setPosition(e.target.value)} placeholder="Ej. QB, RB, WR..." />

          {!isEditing && (
            <>
              <label>¿En qué categoría(s) de esta franquicia juega?</label>
              <div className="franchise-cat-checks">
                {franchiseCategories.map(c => (
                  <label key={c.id} className="check-row">
                    <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => toggleCat(c.id)} />
                    {CATEGORY_LABELS[c.type] || c.type}
                  </label>
                ))}
              </div>
            </>
          )}

          <ImageUploadField label="Foto del jugador" currentUrl={person?.image_url} onFileSelected={setPhotoFile} />

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={loading}>{loading ? loadingLabel : isEditing ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FranchiseRosterManager
