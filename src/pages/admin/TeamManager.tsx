import { useEffect, useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useCategory } from '../../context/CategoryContext'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import CategorySwitcher from '../../components/filters/CategorySwitcher'
import TeamManagerCard from '../../components/Admin/TeamManagerCard'
import TeamFormModal from '../../components/Admin/TeamFormModal'
import PlayerFormModal from '../../components/Admin/PlayerFormModal'
import PlayerRosterManager from '../../components/Admin/PlayerRosterManager'
import FranchiseRosterManager from '../../components/Admin/FranchiseRosterManager'
import FranchiseMergeModal from '../../components/Admin/FranchiseMergeModal'
import AddFranchiseCategoryModal from '../../components/Admin/AddFranchiseCategoryModal'

import {
  getTeamsByCategoryId,
  getTeamsByCategoryIds,
  getTeamsByFranchiseIds,
  deleteTeam,
  setTeamActive,
  setTeamDivision
} from '../../services/team.service.js'
import { getPlayersByTeamIds, setPlayerActive, deletePlayer } from '../../services/player.service.js'
import { getCoachAssignmentsByLeagueId } from '../../services/league_user.service.js'
import { getActiveDivisionsByCategoryId } from '../../services/division.service.js'

import './TeamManager.css'

function TeamManager() {
  const { league } = useLeague()
  const { categories, category, setCategory } = useCategory()
  const confirm = useConfirm()
  const toast = useToast()

  const [teams, setTeams] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [coachesByTeamId, setCoachesByTeamId] = useState({})
  const [divisions, setDivisions] = useState([])

  // { [franchiseId]: [{ id, category_id }] } — todos los Team de la
  // franquicia (en cualquier categoría), para pintar los chips en la
  // tarjeta y saber a qué categorías les falta roster.
  const [franchiseTeamsByFranchiseId, setFranchiseTeamsByFranchiseId] = useState({})

  // Roster unificado del equipo seleccionado, cuando es una franquicia con
  // más de una categoría enlazada.
  const [franchisePlayers, setFranchisePlayers] = useState([])
  const [loadingFranchiseRoster, setLoadingFranchiseRoster] = useState(false)

  const [mergeMode, setMergeMode] = useState(false)
  const [mergeSelection, setMergeSelection] = useState([])
  const [allTeams, setAllTeams] = useState([])
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [showAddCatModal, setShowAddCatModal] = useState(false)

  const [editingTeam, setEditingTeam] = useState(null)
  const [showTeamModal, setShowTeamModal] = useState(false)

  const [editingPlayer, setEditingPlayer] = useState(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)

  useEffect(() => {
    if (!category) return
    loadTeams()
    setSelectedTeamId(null)
  }, [category?.id])

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

  useEffect(() => {
    if (!category) {
      setDivisions([])
      return
    }

    async function loadDivisions() {
      try {
        const data = await getActiveDivisionsByCategoryId(category.id)
        setDivisions(data || [])
      } catch (err) {
        console.error(err)
      }
    }

    loadDivisions()
  }, [category?.id])

  useEffect(() => {
    if (!league?.id) return

    async function loadCoaches() {
      try {
        const assignments = await getCoachAssignmentsByLeagueId(league.id)
        const map = {}
        ;(assignments || []).forEach(a => { map[a.team_id] = a.user })
        setCoachesByTeamId(map)
      } catch (err) {
        console.error(err)
      }
    }

    loadCoaches()
  }, [league?.id])

  // Mapa de franquicias visibles en esta categoría → todos sus Team (en
  // cualquier categoría), para los chips de la tarjeta.
  useEffect(() => {
    const franchiseIds = [...new Set(teams.map(t => t.franchise_id).filter(Boolean))]
    if (franchiseIds.length === 0) {
      setFranchiseTeamsByFranchiseId({})
      return
    }

    getTeamsByFranchiseIds(franchiseIds)
      .then(rows => {
        const map = {}
        ;(rows || []).forEach(row => {
          (map[row.franchise_id] ||= []).push(row)
        })
        setFranchiseTeamsByFranchiseId(map)
      })
      .catch(err => console.error(err))
  }, [teams])

  const selectedTeam = teams.find(t => t.id === selectedTeamId)
  const selectedFranchiseTeams = selectedTeam?.franchise_id
    ? (franchiseTeamsByFranchiseId[selectedTeam.franchise_id] || [])
    : []
  const isFranchiseSelected = selectedFranchiseTeams.length > 1

  // Roster compartido del equipo seleccionado, solo cuando de verdad tiene
  // más de una categoría enlazada — si no, el roster normal de siempre basta.
  useEffect(() => {
    if (!isFranchiseSelected) {
      setFranchisePlayers([])
      return
    }

    const teamIds = selectedFranchiseTeams.map(t => t.id)

    setLoadingFranchiseRoster(true)
    getPlayersByTeamIds(teamIds)
      .then(data => setFranchisePlayers(data || []))
      .catch(err => console.error(err))
      .finally(() => setLoadingFranchiseRoster(false))
  }, [selectedTeam?.franchise_id, selectedFranchiseTeams.length])

  function categoryTypeById(categoryId) {
    return categories.find(c => c.id === categoryId)?.type
  }

  async function reloadAfterFranchiseChange() {
    await loadTeams()
  }

  function handleTeamSaved(savedTeamOrFranchise) {
    if (savedTeamOrFranchise?.franchise) {
      // Se creó una franquicia: puede incluir Team de otras categorías que
      // no se ven aquí — recargamos la categoría activa para traer el suyo.
      reloadAfterFranchiseChange().then(() => {
        const ownTeam = savedTeamOrFranchise.teams.find(t => t.category_id === category.id)
        if (ownTeam) setSelectedTeamId(ownTeam.id)
      })
      return
    }

    setTeams(prev => {
      const exists = prev.some(t => t.id === savedTeamOrFranchise.id)
      if (exists) {
        return prev.map(t => t.id === savedTeamOrFranchise.id ? { ...t, ...savedTeamOrFranchise } : t)
      }
      return [...prev, { ...savedTeamOrFranchise, Player: [] }]
    })
    setSelectedTeamId(savedTeamOrFranchise.id)
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

  async function handleDeleteTeam(team) {
    const ok = await confirm({
      message: `¿Eliminar el equipo "${team.name}"? También se borrarán todos sus partidos, jugadores, estadísticas y asistencia (incluyendo lo que afecte a los equipos rivales de esos partidos). Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true
    })
    if (!ok) return

    try {
      await deleteTeam(team.id)
      setTeams(prev => prev.filter(t => t.id !== team.id))
      if (selectedTeamId === team.id) setSelectedTeamId(null)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo eliminar el equipo')
    }
  }

  async function handleToggleTeamActive(team) {
    try {
      const updated = await setTeamActive(team.id, !team.active)
      setTeams(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
    } catch (err) {
      console.error(err)
      toast.error('No se pudo actualizar el estado del equipo')
    }
  }

  async function handleSetDivision(team, divisionId) {
    try {
      const updated = await setTeamDivision(team.id, divisionId)
      setTeams(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo actualizar la división del equipo')
    }
  }

  async function handleToggleActive(player) {
    try {
      const updated = await setPlayerActive(player.id, !player.active)
      handlePlayerSaved(updated)
    } catch (err) {
      console.error(err)
      toast.error('No se pudo actualizar el estado del jugador')
    }
  }

  async function handleDeletePlayer(player) {
    const ok = await confirm({
      message: `¿Eliminar a "${player.name}"? También se borrarán todas sus estadísticas y asistencia registradas. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true
    })
    if (!ok) return

    try {
      await deletePlayer(player.id)
      setTeams(prev => prev.map(t => t.id === selectedTeamId
        ? { ...t, Player: (t.Player || []).filter(p => p.id !== player.id) }
        : t
      ))
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo eliminar el jugador')
    }
  }

  // ---- Fusionar equipos ----
  async function handleEnterMergeMode() {
    try {
      const data = await getTeamsByCategoryIds(categories.map(c => c.id))
      setAllTeams(data || [])
      setMergeMode(true)
      setMergeSelection([])
      setSelectedTeamId(null)
    } catch (err) {
      console.error(err)
      toast.error('No se pudieron cargar los equipos')
    }
  }

  function handleCancelMerge() {
    setMergeMode(false)
    setMergeSelection([])
  }

  function handleToggleMergeSelect(team) {
    setMergeSelection(prev => prev.includes(team.id) ? prev.filter(id => id !== team.id) : [...prev, team.id])
  }

  async function handleMergeDone() {
    setShowMergeModal(false)
    setMergeMode(false)
    setMergeSelection([])
    await reloadAfterFranchiseChange()
    toast.success('Franquicia creada')
  }

  const mergeTeams = allTeams.filter(t => mergeSelection.includes(t.id))
  const canAddCategory = !!selectedTeam && categories.length > (selectedTeam.franchise_id ? selectedFranchiseTeams.length : 1)

  return (
    <div className="app-layout">
      <Header league={league}/>
      <main className="team-manager-container">
        <div className="team-manager-intro">
          <h2>Gestor de Equipos</h2>
          <p>Crea equipos y administra sus rosters para {league?.name}</p>
        </div>

        <CategorySwitcher categories={categories} active={category} onChange={setCategory} label="Editando categoría"/>

        <div className="section-header">
          <h3>{mergeMode ? 'Selecciona 2 o más equipos para fusionar' : 'Equipos'}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {mergeMode ? (
              <button className="primary-btn" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }} onClick={handleCancelMerge}>
                Cancelar
              </button>
            ) : (
              <button className="primary-btn" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }} onClick={handleEnterMergeMode}>
                🔀 Fusionar equipos
              </button>
            )}
            {!mergeMode && (
              <button
                className="primary-btn"
                onClick={() => { setEditingTeam(null); setShowTeamModal(true) }}
                disabled={!category}
              >
                + Nuevo equipo
              </button>
            )}
            {mergeMode && (
              <button
                className="primary-btn"
                disabled={mergeSelection.length < 2}
                onClick={() => {
                  const picked = allTeams.filter(t => mergeSelection.includes(t.id))
                  const categoryIds = picked.map(t => t.category_id)
                  const hasDuplicateCategory = new Set(categoryIds).size !== categoryIds.length
                  if (hasDuplicateCategory) {
                    toast.error('Dos de los equipos que elegiste son de la misma categoría — una franquicia necesita un equipo por categoría distinta')
                    return
                  }
                  setShowMergeModal(true)
                }}
              >
                Fusionar seleccionados ({mergeSelection.length})
              </button>
            )}
          </div>
        </div>

        {(() => {
          const visibleTeams = mergeMode ? allTeams : teams
          if (!loadingTeams && visibleTeams.length === 0) {
            return <p className="empty-state">Esta categoría aún no tiene equipos</p>
          }
          return (
            <div className="team-manager-grid">
              {visibleTeams.map(team => (
                <TeamManagerCard
                  key={team.id}
                  team={team}
                  coach={coachesByTeamId[team.id]}
                  isSelected={selectedTeamId === team.id}
                  onSelect={t => setSelectedTeamId(t.id)}
                  onEdit={t => { setEditingTeam(t); setShowTeamModal(true) }}
                  onDelete={handleDeleteTeam}
                  onToggleActive={handleToggleTeamActive}
                  divisions={mergeMode ? [] : divisions}
                  onSetDivision={handleSetDivision}
                  franchiseCategories={[...new Set((franchiseTeamsByFranchiseId[team.franchise_id] || []).map(ft => ft.category_id))]
                    .map(categoryId => ({ type: categoryTypeById(categoryId) }))
                    .filter(c => c.type)}
                  activeCategoryType={category?.type}
                  mergeMode={mergeMode}
                  mergeSelected={mergeSelection.includes(team.id)}
                  onToggleMergeSelect={handleToggleMergeSelect}
                />
              ))}
            </div>
          )
        })()}

        {!mergeMode && selectedTeam && (
          isFranchiseSelected ? (
            <FranchiseRosterManager
              team={selectedTeam}
              franchiseTeams={selectedFranchiseTeams}
              categories={categories}
              players={franchisePlayers}
              loading={loadingFranchiseRoster}
              onPlayersChanged={setFranchisePlayers}
              onAddCategory={canAddCategory ? () => setShowAddCatModal(true) : undefined}
            />
          ) : (
            <PlayerRosterManager
              team={selectedTeam}
              onAddPlayer={() => { setEditingPlayer(null); setShowPlayerModal(true) }}
              onEditPlayer={p => { setEditingPlayer(p); setShowPlayerModal(true) }}
              onToggleActive={handleToggleActive}
              onDeletePlayer={handleDeletePlayer}
              onAddCategory={canAddCategory ? () => setShowAddCatModal(true) : undefined}
            />
          )
        )}
      </main>

      {showTeamModal && (
        <TeamFormModal
          categoryId={category?.id}
          categories={categories}
          leagueId={league?.id}
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

      {showMergeModal && (
        <FranchiseMergeModal
          leagueId={league?.id}
          teams={mergeTeams}
          categories={categories}
          onClose={() => setShowMergeModal(false)}
          onMerged={handleMergeDone}
        />
      )}

      {showAddCatModal && selectedTeam && (
        <AddFranchiseCategoryModal
          team={selectedTeam}
          leagueId={league?.id}
          franchiseTeams={selectedFranchiseTeams.length ? selectedFranchiseTeams : [{ id: selectedTeam.id, category_id: selectedTeam.category_id }]}
          categories={categories}
          onClose={() => setShowAddCatModal(false)}
          onAdded={async () => {
            setShowAddCatModal(false)
            await reloadAfterFranchiseChange()
            toast.success('Categoría agregada')
          }}
        />
      )}

      <Footer />
    </div>
  )
}

export default TeamManager
