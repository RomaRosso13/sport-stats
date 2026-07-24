import { useEffect, useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useLeagueMembership } from '../../hooks/useLeagueMembership'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import TeamFormModal from '../../components/Admin/TeamFormModal'
import PlayerFormModal from '../../components/Admin/PlayerFormModal'
import PlayerRosterManager from '../../components/Admin/PlayerRosterManager'
import TeamLogo from '../../components/common/TeamLogo'

import { getTeamsByIds } from '../../services/team.service.js'
import { setPlayerActive } from '../../services/player.service.js'

import './CoachTeamManager.css'

const CATEGORY_LABELS = {
  Mixto: 'Mixto',
  Femenil: 'Femenil',
  Varonil: 'Varonil'
}

function CoachTeamManager() {
  const { league } = useLeague()
  const { teamIds, loading: membershipLoading } = useLeagueMembership()

  const [teams, setTeams] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [selectedTeamId, setSelectedTeamId] = useState(null)

  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)

  useEffect(() => {
    if (membershipLoading) return

    if (!teamIds.length) {
      setTeams([])
      setLoadingTeams(false)
      return
    }

    async function loadTeams() {
      try {
        setLoadingTeams(true)
        const data = await getTeamsByIds(teamIds)
        setTeams(data || [])
        setSelectedTeamId(prev => (prev && data.some(t => t.id === prev)) ? prev : (data[0]?.id ?? null))
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingTeams(false)
      }
    }

    loadTeams()
  }, [membershipLoading, teamIds.join(',')])

  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  function handleTeamSaved(savedTeam) {
    setTeams(prev => prev.map(t => t.id === savedTeam.id ? { ...t, ...savedTeam } : t))
  }

  function handlePlayerSaved(savedPlayer) {
    setTeams(prev => prev.map(t => {
      if (t.id !== selectedTeamId) return t

      const players = t.Player || []
      const exists = players.some(p => p.id === savedPlayer.id)

      return {
        ...t,
        Player: exists
          ? players.map(p => p.id === savedPlayer.id ? savedPlayer : p)
          : [...players, savedPlayer]
      }
    }))
  }

  async function handleToggleActive(player) {
    try {
      const updated = await setPlayerActive(player.id, !player.active)
      handlePlayerSaved(updated)
    } catch (err) {
      console.error(err)
      alert('No se pudo actualizar el estado del jugador')
    }
  }

  const loading = membershipLoading || loadingTeams

  return (
    <div className="app-layout">
      <Header league={league} />
      <main className="coach-team-manager-container">
        <div className="coach-team-manager-intro">
          <h2>Mi Equipo</h2>
          <p>Administra la información y el roster de tu equipo en {league?.name}</p>
        </div>

        {loading ? (
          <p className="empty-state">Cargando...</p>
        ) : teams.length === 0 ? (
          <p className="empty-state">
            Aún no tienes ningún equipo asignado. Pide a un administrador de {league?.name} que te asigne uno.
          </p>
        ) : (
          <>
            {teams.length > 1 && (
              <div className="coach-team-switcher">
                {teams.map(team => (
                  <button
                    key={team.id}
                    type="button"
                    className={`coach-team-tab ${team.id === selectedTeamId ? 'active' : ''}`}
                    onClick={() => setSelectedTeamId(team.id)}
                  >
                    {team.name}
                    {team.category?.type && (
                      <span className="coach-team-tab-category">
                        {CATEGORY_LABELS[team.category.type] || team.category.type}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedTeam && (
              <>
                <div className="coach-team-info-card">
                  <TeamLogo logoUrl={selectedTeam.logo_url} name={selectedTeam.name} alt={selectedTeam.name} className="coach-team-logo" />
                  <div className="coach-team-info-text">
                    <h3>{selectedTeam.name}</h3>
                    {selectedTeam.category?.type && (
                      <span className="coach-team-category-badge">
                        {CATEGORY_LABELS[selectedTeam.category.type] || selectedTeam.category.type}
                      </span>
                    )}
                  </div>
                  <button className="primary-btn" onClick={() => setShowTeamModal(true)}>
                    Editar equipo
                  </button>
                </div>

                <PlayerRosterManager
                  team={selectedTeam}
                  onAddPlayer={() => { setEditingPlayer(null); setShowPlayerModal(true) }}
                  onEditPlayer={p => { setEditingPlayer(p); setShowPlayerModal(true) }}
                  onToggleActive={handleToggleActive}
                />
              </>
            )}
          </>
        )}
      </main>

      {showTeamModal && selectedTeam && (
        <TeamFormModal
          categoryId={selectedTeam.category_id}
          team={selectedTeam}
          onClose={() => setShowTeamModal(false)}
          onSaved={handleTeamSaved}
        />
      )}

      {showPlayerModal && selectedTeam && (
        <PlayerFormModal
          teamId={selectedTeam.id}
          player={editingPlayer}
          onClose={() => setShowPlayerModal(false)}
          onSaved={handlePlayerSaved}
        />
      )}

      <Footer />
    </div>
  )
}

export default CoachTeamManager
