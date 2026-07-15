import { useEffect, useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useAuth } from '../../context/AuthContext'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import AddUserModal from '../../components/Admin/AddUserModal'

import {
  getLeagueMembers,
  updateLeagueMemberRole,
  removeLeagueMember
} from '../../services/league_user.service.js'

import './UserManager.css'

const ROLE_OPTIONS = ['Staff', 'Admin', 'SuperAdmin']

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || '?'
}

function UserManager() {
  const { league } = useLeague()
  const { user } = useAuth()

  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (!league) return

    async function loadMembers() {
      try {
        setLoadingMembers(true)
        const data = await getLeagueMembers(league.id)
        setMembers(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingMembers(false)
      }
    }

    loadMembers()
  }, [league?.id])

  function handleMemberAdded(newMember) {
    setMembers(prev => [...prev, newMember])
  }

  async function handleRoleChange(member, role) {
    try {
      setUpdatingId(member.id)
      await updateLeagueMemberRole(member.id, role)
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role } : m))
    } catch (err) {
      console.error(err)
      alert('No se pudo actualizar el rol')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleRemove(member) {
    if (!window.confirm(`¿Quitar a ${member.user?.name || member.user?.email} de la liga?`)) return

    try {
      setUpdatingId(member.id)
      await removeLeagueMember(member.id)
      setMembers(prev => prev.filter(m => m.id !== member.id))
    } catch (err) {
      console.error(err)
      alert('No se pudo quitar al usuario')
    } finally {
      setUpdatingId(null)
    }
  }

  const existingUserIds = members.map(m => m.user?.id).filter(Boolean)

  return (
    <div className="app-layout">
      <Header league={league}/>
      <main className="user-manager-container">
        <div className="user-manager-intro">
          <h2>Gestor de Usuarios</h2>
          <p>Administra quién tiene acceso de administración para {league?.name}</p>
        </div>

        <div className="section-header">
          <h3>Usuarios</h3>
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            + Agregar usuario
          </button>
        </div>

        {!loadingMembers && members.length === 0 ? (
          <p className="empty-state">Esta liga aún no tiene usuarios asignados</p>
        ) : (
          <div className="user-list">
            {members.map(member => {
              const isSelf = member.user?.auth_user_id === user?.id

              return (
                <div key={member.id} className="user-row">
                  <div className="user-main">
                    <div className="user-avatar">{getInitial(member.user?.name)}</div>
                    <div className="user-info">
                      <span className="user-name">
                        {member.user?.name || 'Sin nombre'}
                        {isSelf && <span className="user-self-tag">Tú</span>}
                      </span>
                      <span className="user-email">{member.user?.email}</span>
                    </div>
                  </div>

                  <div className="user-actions">
                    <select
                      className="role-select"
                      value={member.role || ''}
                      disabled={isSelf || updatingId === member.id}
                      onChange={e => handleRoleChange(member, e.target.value)}
                    >
                      {ROLE_OPTIONS.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="remove-user-btn"
                      disabled={isSelf || updatingId === member.id}
                      onClick={() => handleRemove(member)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddUserModal
          leagueId={league?.id}
          existingUserIds={existingUserIds}
          onClose={() => setShowAddModal(false)}
          onAdded={handleMemberAdded}
        />
      )}

      <Footer />
    </div>
  )
}

export default UserManager
