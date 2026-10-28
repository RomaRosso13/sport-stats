import { useState } from 'react'
import { mergeTeamsIntoFranchise } from '../../services/team.service.js'
import { setPersonKeyForPlayers } from '../../services/player.service.js'

import './TeamFormModal.css'
import './FranchiseMergeModal.css'

const CATEGORY_LABELS = { Mixto: 'Mixto', Femenil: 'Femenil', Varonil: 'Varonil' }

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || '?'
}

// Jugadores con el mismo nombre en más de un equipo seleccionado: lo más
// probable es que sea la misma persona (ej. ya jugaba Varonil y Femenil como
// dos altas separadas antes de que existieran las franquicias), así que se
// combinan por default — el admin puede destildarlo si en realidad son dos
// personas distintas con el mismo nombre.
function buildMergedRoster(teams) {
  const byName: Record<string, any[]> = {}
  teams.forEach(team => {
    ;(team.Player || []).forEach(player => {
      const key = player.name.trim().toLowerCase()
      ;(byName[key] ||= []).push({ player, team })
    })
  })

  return Object.entries(byName).map(([key, entries]) => ({
    key,
    name: entries[0].player.name,
    number: entries[0].player.number,
    sources: entries.map(e => e.team.name),
    playerIds: entries.map(e => e.player.id),
    isDup: entries.length > 1,
    combine: true
  }))
}

function FranchiseMergeModal({ leagueId, teams, categories, onClose, onMerged }) {
  const [name, setName] = useState(teams[0]?.name || '')
  const [mergedRoster, setMergedRoster] = useState(() => buildMergedRoster(teams))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const allCategoryIds = [...new Set(teams.map(t => t.category_id))]
  const categoryLabels = allCategoryIds
    .map(id => categories.find(c => c.id === id))
    .filter(Boolean)
    .map(c => CATEGORY_LABELS[c.type] || c.type)

  function toggleCombine(key) {
    setMergedRoster(prev => prev.map(r => r.key === key ? { ...r, combine: !r.combine } : r))
  }

  const totalPlayers = mergedRoster.reduce((sum, r) => sum + (r.isDup && !r.combine ? r.playerIds.length : 1), 0)

  async function handleConfirm() {
    if (!name.trim()) { setError('Ponle un nombre a la franquicia'); return }

    try {
      setLoading(true)
      setError('')

      const firstTeam = teams[0]
      await mergeTeamsIntoFranchise(leagueId, teams.map(t => t.id), {
        name: name.trim(),
        logoUrl: firstTeam?.logo_url,
        primaryColor: firstTeam?.primary_color
      })

      for (const row of mergedRoster) {
        if (row.isDup && row.combine) {
          await setPersonKeyForPlayers(row.playerIds, crypto.randomUUID())
        }
      }

      onMerged()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudieron fusionar los equipos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ width: 480 }}>
        <h3>Fusionar equipos en una franquicia</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -6, marginBottom: 14 }}>
          Se va a crear UN solo equipo con el roster combinado. Los equipos originales se enlazan a la
          franquicia (sus partidos y estadísticas se quedan igual).
        </p>

        <label>Nombre de la franquicia</label>
        <input value={name} onChange={e => setName(e.target.value)} />

        <label>Categorías resultantes</label>
        <div className="merge-cat-chips">
          {categoryLabels.map(label => <span key={label} className="merge-cat-chip">{label}</span>)}
        </div>

        <label>Roster combinado ({totalPlayers} jugadores)</label>
        <div className="merge-roster-preview">
          {mergedRoster.map(row => (
            <div key={row.key} className={`merge-roster-row ${row.isDup ? 'dup' : ''}`}>
              <div className="merge-roster-avatar">{getInitial(row.name)}</div>
              <div className="merge-roster-info">
                <div className="merge-roster-name">{row.name}</div>
                <div className="merge-roster-sub">
                  {row.isDup ? `aparece en ${row.sources.join(' y ')}` : `de ${row.sources[0]}`}
                </div>
              </div>
              {row.isDup && (
                <label className="merge-dup-check">
                  <input type="checkbox" checked={row.combine} onChange={() => toggleCombine(row.key)} />
                  ¿Es la misma persona? Combinar
                </label>
              )}
            </div>
          ))}
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="button" disabled={loading} onClick={handleConfirm}>
            {loading ? 'Fusionando...' : 'Fusionar y crear franquicia'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FranchiseMergeModal
