import { useState } from 'react'

import { createUser } from '../../services/create_user.service.js'
import TeamMultiPicker from './TeamMultiPicker'

import './CreateUserModal.css'

const ROLE_OPTIONS = ['Fotografo', 'Referi', 'Coach']

function CreateUserModal({ leagueId, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Fotografo')

  const [selectedTeamIds, setSelectedTeamIds] = useState([])

  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('')
  const [error, setError] = useState('')

  const isCoach = role === 'Coach'

  function handleRoleChange(newRole) {
    setRole(newRole)
    setSelectedTeamIds([])
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Nombre, correo y contraseña son obligatorios')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      setLoading(true)
      setError('')
      setLoadingLabel('Creando cuenta...')

      const result = await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        leagueId,
        role,
        teamIds: isCoach ? selectedTeamIds : []
      })

      onCreated(result)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo crear el usuario')
    } finally {
      setLoading(false)
      setLoadingLabel('')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Crear usuario</h3>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Juan Pérez"
          />

          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
          />

          <label>Contraseña temporal</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <p className="create-user-hint">Compártesela a la persona por fuera de la app; podrá cambiarla después.</p>

          <label>Rol</label>
          <select value={role} onChange={e => handleRoleChange(e.target.value)}>
            {ROLE_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {isCoach && (
            <div className="coach-team-picker">
              <p className="create-user-hint">
                Puedes ligarlo a uno o varios equipos ya creados (por ejemplo, si maneja las categorías Femenil, Mixto y Varonil del mismo equipo), o dejarlo sin equipo por ahora.
              </p>

              <TeamMultiPicker leagueId={leagueId} value={selectedTeamIds} onChange={setSelectedTeamIds} />
            </div>
          )}

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? loadingLabel : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateUserModal
