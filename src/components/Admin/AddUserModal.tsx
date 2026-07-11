import { useState } from 'react'
import { findUserByEmail, addLeagueMember } from '../../services/league_user.service.js'

import './AddUserModal.css'

const ROLE_OPTIONS = ['Staff', 'Admin', 'SuperAdmin']

function AddUserModal({ leagueId, existingUserIds = [], onClose, onAdded }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Staff')
  const [foundUser, setFoundUser] = useState(null)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setLoading(true)
      setError('')
      setFoundUser(null)
      setSearched(false)

      const user = await findUserByEmail(email)

      setSearched(true)
      setFoundUser(user)

      if (user && existingUserIds.includes(user.id)) {
        setError('Este usuario ya pertenece a la liga')
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo buscar el usuario')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!foundUser) return

    try {
      setLoading(true)
      setError('')

      const saved = await addLeagueMember(leagueId, foundUser.id, role)

      onAdded(saved)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo agregar al usuario')
    } finally {
      setLoading(false)
    }
  }

  const alreadyMember = foundUser && existingUserIds.includes(foundUser.id)

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Agregar usuario</h3>

        <form onSubmit={handleSearch}>
          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setSearched(false); setFoundUser(null); setError('') }}
            placeholder="correo@ejemplo.com"
          />

          <div className="modal-actions inline">
            <button type="submit" disabled={loading || !email.trim()}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {searched && !foundUser && (
          <p className="add-user-hint">
            No encontramos una cuenta con ese correo. La persona debe crear su cuenta primero (por ahora, directamente en Supabase) y luego podrás asignarle un rol aquí.
          </p>
        )}

        {foundUser && (
          <div className="add-user-found">
            <div className="add-user-found-info">
              <span className="add-user-found-name">{foundUser.name || 'Sin nombre'}</span>
              <span className="add-user-found-email">{foundUser.email}</span>
            </div>

            <label>Rol</label>
            <select value={role} onChange={e => setRole(e.target.value)} disabled={alreadyMember}>
              {ROLE_OPTIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleAdd}
            disabled={!foundUser || alreadyMember || loading}
          >
            {loading ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddUserModal
