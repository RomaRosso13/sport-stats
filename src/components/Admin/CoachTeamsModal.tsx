import { useEffect, useState } from 'react'

import { getTeamIdsForLeagueUser, setCoachTeams } from '../../services/league_user.service.js'
import TeamMultiPicker from './TeamMultiPicker'

import './CreateUserModal.css'

function CoachTeamsModal({ leagueId, member, onClose, onSaved }) {
  const [teamIds, setTeamIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const ids = await getTeamIdsForLeagueUser(member.id)
        setTeamIds(ids)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los equipos actuales')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [member.id])

  async function handleSave() {
    try {
      setSaving(true)
      setError('')
      await setCoachTeams(member.id, teamIds)
      onSaved(teamIds)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudieron guardar los equipos')
    } finally {
      setSaving(false)
    }
  }

  const name = member.user?.name || member.user?.email

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Equipos de {name}</h3>
        <p className="create-user-hint">
          Elige uno o varios equipos para este coach (por ejemplo, si maneja las categorías Femenil, Mixto y Varonil del mismo equipo).
        </p>

        {loading ? (
          <p className="create-user-hint">Cargando equipos actuales...</p>
        ) : (
          <TeamMultiPicker leagueId={leagueId} value={teamIds} onChange={setTeamIds} />
        )}

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={loading || saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CoachTeamsModal
