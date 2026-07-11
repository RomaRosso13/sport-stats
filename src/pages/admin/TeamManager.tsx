import { useEffect, useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useCategory } from '../../context/CategoryContext'

import Header from '../../components/common/Header'
import CategorySelector from '../../components/filters/CategorySelector'
import TeamManagerCard from '../../components/Admin/TeamManagerCard'
import TeamFormModal from '../../components/Admin/TeamFormModal'
import PlayerFormModal from '../../components/Admin/PlayerFormModal'
import PlayerRosterManager from '../../components/Admin/PlayerRosterManager'

import { getTeamsByCategoryId } from '../../services/team.service.js'
import { setPlayerActive } from '../../services/player.service.js'

import './TeamManager.css'

function TeamManager() {
  const { league } = useLeague()
  const { categories, category, setCategory } = useCategory()

  const [teams, setTeams] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [selectedTeamId, setSelectedTeamId] = useState(null)

  const [editingTeam, setEditingTeam] = useState(null)
  const [showTeamModal, setShowTeamModal] = useState(false)

  const [editingPlayer, setEditingPlayer] = useState(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)

  useEffect(() => {
    if (!category) return

    async function loadTeams() {
      try {
        setLoadingTeams(true)
        const teamsData = await getTeamsByCategoryId(category.id)
        setTeams(teamsData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingTeams(false)
      }
    }

    loadTeams()
    setSelectedTeamId(null)
  }, [category?.id])

  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  function handleTeamSaved(savedTeam) {
    setTeams(prev => {
      const exists = prev.some(t => t.id === savedTeam.id)
      if (exists) {
        return prev.map(t => t.id === savedTeam.id ? { ...t, ...savedTeam } : t)
      }
      return [...prev, { ...savedTeam, Player: [] }]
    })
    setSelectedTeamId(savedTeam.id)
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

  return (
    <div className="app-layout">
      <Header league={league}/>
      <main className="team-manager-container">
        <div className="team-manager-intro">
          <h2>Gestor de Equipos</h2>
          <p>Crea equipos y administra sus rosters para {league?.name}</p>
        </div>

        <CategorySelector categories={categories} active={category} onChange={setCategory}/>

        <div className="section-header">
          <h3>Equipos</h3>
          <button
            className="primary-btn"
            onClick={() => { setEditingTeam(null); setShowTeamModal(true) }}
            disabled={!category}
          >
            + Nuevo equipo
          </button>
        </div>

        {!loadingTeams && teams.length === 0 ? (
          <p className="empty-state">Esta categoría aún no tiene equipos</p>
        ) : (
          <div className="team-manager-grid">
            {teams.map(team => (
              <TeamManagerCard
                key={team.id}
                team={team}
                isSelected={selectedTeamId === team.id}
                onSelect={t => setSelectedTeamId(t.id)}
                onEdit={t => { setEditingTeam(t); setShowTeamModal(true) }}
              />
            ))}
          </div>
        )}

        {selectedTeam && (
          <PlayerRosterManager
            team={selectedTeam}
            onAddPlayer={() => { setEditingPlayer(null); setShowPlayerModal(true) }}
            onEditPlayer={p => { setEditingPlayer(p); setShowPlayerModal(true) }}
            onToggleActive={handleToggleActive}
          />
        )}
      </main>

      {showTeamModal && (
        <TeamFormModal
          categoryId={category?.id}
          team={editingTeam}
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

      <footer className="app-footer">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </footer>
    </div>
  )
}

export default TeamManager
