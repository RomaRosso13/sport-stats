import { useEffect, useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useAuth } from '../../context/AuthContext'
import { useLeagueMembership } from '../../hooks/useLeagueMembership'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import AddUserModal from '../../components/Admin/AddUserModal'
import CreateUserModal from '../../components/Admin/CreateUserModal'
import CoachTeamsModal from '../../components/Admin/CoachTeamsModal'

import {
  getLeagueMembers,
  updateLeagueMemberRole
} from '../../services/league_user.service.js'
import { deleteUserFromLeague } from '../../services/create_user.service.js'

import './UserManager.css'

const ROLE_OPTIONS = ['Referi', 'Admin', 'SuperAdmin', 'Fotografo', 'Coach']

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || '?'
}

function UserManager() {
  const { league } = useLeague()
  const { user } = useAuth()
  const { role: viewerRole } = useLeagueMembership()
  const viewerIsSuperAdmin = viewerRole === 'SuperAdmin'

  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [editingTeamsMember, setEditingTeamsMember] = useState(null)

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

  function handleUserCreated({ user, membership }) {
    setMembers(prev => [...prev, {
      id: membership.id,
      role: membership.role,
      user: { id: user.id, name: user.name, email: user.email, auth_user_id: user.auth_user_id }
    }])
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
    const name = member.user?.name || member.user?.email
    const confirmed = window.confirm(
      `¿Quitar a ${name} de la liga? Si no pertenece a ninguna otra liga, su cuenta se eliminará ` +
      `por completo (incluyendo su acceso para iniciar sesión). Esta acción no se puede deshacer.`
    )
    if (!confirmed) return

    try {
      setUpdatingId(member.id)
      await deleteUserFromLeague(member.id)
      setMembers(prev => prev.filter(m => m.id !== member.id))
    } catch (err) {
      console.error(err)
      alert(err.message || 'No se pudo quitar al usuario')
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
          <div className="user-manager-header-actions">
            <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
              + Crear usuario
            </button>
            <button className="primary-btn secondary-action" onClick={() => setShowAddModal(true)}>
              + Agregar usuario existente
            </button>
          </div>
        </div>

        {!loadingMembers && members.length === 0 ? (
          <p className="empty-state">Esta liga aún no tiene usuarios asignados</p>
        ) : (
          <div className="user-list">
            {members.map(member => {
              const isSelf = member.user?.auth_user_id === user?.id
              const isProtected = !isSelf && !viewerIsSuperAdmin && (member.role === 'Admin' || member.role === 'SuperAdmin')
              const isLocked = isSelf || isProtected

              return (
                <div key={member.id} className="user-row">
                  <div className="user-main">
                    <div className="user-avatar">{getInitial(member.user?.name)}</div>
                    <div className="user-info">
                      <span className="user-name">
                        {member.user?.name || 'Sin nombre'}
                        {isSelf && <span className="user-self-tag">Tú</span>}
                        {isProtected && (
                          <span className="user-protected-tag" title="Solo un SuperAdmin puede modificar a otro Admin o SuperAdmin">
                            Protegido
                          </span>
                        )}
                      </span>
                      <span className="user-email">{member.user?.email}</span>
                    </div>
                  </div>

                  <div className="user-actions">
                    <select
                      className="role-select"
                      value={member.role || ''}
                      disabled={isLocked || updatingId === member.id}
                      onChange={e => handleRoleChange(member, e.target.value)}
                    >
                      {ROLE_OPTIONS.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>

                    {member.role === 'Coach' && (
                      <button
                        type="button"
                        className="edit-teams-btn"
                        onClick={() => setEditingTeamsMember(member)}
                      >
                        Equipos
                      </button>
                    )}

                    <button
                      type="button"
                      className="remove-user-btn"
                      disabled={isLocked || updatingId === member.id}
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

      {showCreateModal && (
        <CreateUserModal
          leagueId={league?.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleUserCreated}
        />
      )}

      {editingTeamsMember && (
        <CoachTeamsModal
          leagueId={league?.id}
          member={editingTeamsMember}
          onClose={() => setEditingTeamsMember(null)}
          onSaved={() => {}}
        />
      )}

      <Footer />
    </div>
  )
}

export default UserManager
