import { useEffect, useState } from 'react'
import { useCategory } from '../../context/CategoryContext';
import { useLeague } from '../../context/LeagueContext'
import { useLeagueMembership } from '../../hooks/useLeagueMembership'

import MatchdaySelector from '../../components/Admin/MatchdaySelector'
import MatchList from '../../components/Admin/MatchList'
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import CategorySwitcher from '../../components/filters/CategorySwitcher';
import Loader from '../../components/common/Loader';
import PageWrapper from '../../components/common/PageWrapper';

import { getMatchesByMatchDayIds, updateMatches } from '../../services/match.service'
import { getMatchDaysByCategoryId } from '../../services/matchday.service'
import { getTeamsByCategoryId } from '../../services/team.service'
import { getIndividualStatsByCategory, saveIndividualStatsForMatch } from '../../services/individual_stats.service'

import './MatchdayEditor.css'

const STAT_FIELDS = ['touchdown', 'touchdown_pass', 'sacks', 'interceptions'] as const
type StatField = typeof STAT_FIELDS[number]

type StatEntry = {
  id: string
  playerId: number
  playerName: string
  playerNumber: number
  teamId: number
  teamLabel: string
  statKey: StatField
  amount: number
}

type StatsDraft = Record<number, StatEntry[]>

type PlayerStatsDelta = {
  matchId: number
  playerId: number
  teamId: number
  touchdown: number
  touchdown_pass: number
  sacks: number
  interceptions: number
}

function EditMatchday() {
  const [matchdays, setMatchdays] = useState([]) // Jornadas con Partidos
  const { categories, category, setCategory } = useCategory()
  const [selectedMatchday, setSelectedMatchday] = useState(null)
  const { league } = useLeague()
  const { isReferee, userId } = useLeagueMembership()
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [teams, setTeams] = useState([])
  const [statsTotals, setStatsTotals] = useState({})
  const [statsByMatch, setStatsByMatch] = useState({})
  const [statsDraft, setStatsDraft] = useState<StatsDraft>({})

  useEffect(() => {
    if (!category) return

    async function loadMatchdays() {
      const matchdaysData = await getMatchDaysByCategoryId(category.id)
      const ids = matchdaysData.map(md => md.id)
      const allMatches = await getMatchesByMatchDayIds(ids)
      const matchesMap = {}
      allMatches.forEach(match => {
        if (!matchesMap[match.matchday_id]) {
          matchesMap[match.matchday_id] = []
        }
        matchesMap[match.matchday_id].push(match)
      })

      setMatchdays(
        matchdaysData.map(md => ({
          ...md,
          games: matchesMap[md.id] || []
        }))
      )
      setSelectedMatchday(matchdaysData[0])
    }

    loadMatchdays()
  }, [category?.id])

  async function loadRostersAndStats() {
    if (!category) return

    const [teamsData, statsData] = await Promise.all([
      getTeamsByCategoryId(category.id),
      getIndividualStatsByCategory(category.id)
    ])

    setTeams(teamsData || [])

    const totals = {}
    const byMatch = {}
    ;(statsData || []).forEach(row => {
      const rowTotals = {}
      STAT_FIELDS.forEach(field => { rowTotals[field] = row[field] || 0 })
      totals[row.player_id] = rowTotals

      if (row.match_id != null) {
        if (!byMatch[row.match_id]) byMatch[row.match_id] = []
        byMatch[row.match_id].push(row)
      }
    })
    setStatsTotals(totals)
    setStatsByMatch(byMatch)
  }

  useEffect(() => {
    loadRostersAndStats()
  }, [category?.id])

  // Limpia el borrador de estadísticas al cambiar de jornada
  useEffect(() => {
    setStatsDraft({})
  }, [selectedMatchday?.id])

  function addStatEntry(matchId: number, entry: Omit<StatEntry, 'id'>) {
    setIsDirty(true)
    setStatsDraft(prev => {
      const matchEntries = prev[matchId] || []
      const existingIndex = matchEntries.findIndex(e =>
        String(e.playerId) === String(entry.playerId) && e.statKey === entry.statKey
      )

      let updatedEntries: StatEntry[]
      if (existingIndex >= 0) {
        updatedEntries = matchEntries.map((e, i) =>
          i === existingIndex ? { ...e, amount: e.amount + entry.amount } : e
        )
      } else {
        updatedEntries = [...matchEntries, { id: window.crypto.randomUUID(), ...entry }]
      }

      return { ...prev, [matchId]: updatedEntries }
    })
  }

  function removeStatEntry(matchId: number, entryId: string) {
    setIsDirty(true)
    setStatsDraft(prev => ({
      ...prev,
      [matchId]: (prev[matchId] || []).filter(e => e.id !== entryId)
    }))
  }

  function handlePlayerCreated(newPlayer) {
    setTeams(prev =>
      prev.map(team =>
        team.id === newPlayer.team_id
          ? { ...team, Player: [...(team.Player || []), newPlayer] }
          : team
      )
    )
  }

  const currentMatchday = matchdays.find( md => md.id === selectedMatchday?.id)

  // Advierte al cerrar/recargar la pestaña si hay cambios sin guardar.
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Advierte al navegar a otra pantalla dentro de la app (links del Header/Footer)
  // si hay cambios sin guardar.
  useEffect(() => {
    function handleClickCapture(e) {
      if (!isDirty) return

      const link = e.target.closest('a')
      if (!link || link.target === '_blank') return

      const destination = new URL(link.href, window.location.href)
      if (destination.pathname === window.location.pathname) return

      const confirmed = window.confirm(
        'Tienes cambios sin guardar. Si sales de esta pantalla, todos los datos no guardados se perderán. ¿Deseas continuar?'
      )
      if (!confirmed) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('click', handleClickCapture, true)
    return () => document.removeEventListener('click', handleClickCapture, true)
  }, [isDirty])

async function handleSave() {
  if (!currentMatchday) return

  try {
    setSaving(true)
    setSaveSuccess(false)

    await updateMatches(currentMatchday.games, userId)

    const perMatchPlayer: Record<string, PlayerStatsDelta> = {}
    Object.entries(statsDraft).forEach(([matchIdKey, matchEntries]) => {
      const matchId = Number(matchIdKey)

      matchEntries.forEach(entry => {
        const key = `${matchId}_${entry.playerId}`
        if (!perMatchPlayer[key]) {
          perMatchPlayer[key] = {
            matchId,
            playerId: entry.playerId,
            teamId: entry.teamId,
            touchdown: 0,
            touchdown_pass: 0,
            sacks: 0,
            interceptions: 0
          }
        }
        perMatchPlayer[key][entry.statKey] += entry.amount
      })
    })

    const statEntries = Object.values(perMatchPlayer)
    if (statEntries.length) {
      await saveIndividualStatsForMatch(category.id, statEntries)
    }

    setStatsDraft({})
    await loadRostersAndStats()

    setIsDirty(false)
    setSaveSuccess(true)

    // Oculta success después de 2s
    setTimeout(() => setSaveSuccess(false), 2000)

  } catch (error) {
    console.error('Supabase error:', error.message)
    alert('Error al guardar los cambios')
  } finally {
    setSaving(false)
  }
}


  return (
    <div className='app-layout'>
    <Loader show={saving} label="Cargando..." />
    <PageWrapper loading={saving}/>

      <Header league={league}/>
      <main className="matchday-editor-container">
        <div className="matchday-editor-intro">
          <h2>Registrar Resultados</h2>
          <p>Elige la jornada, captura el marcador de cada partido y marca cuáles ya terminaron.</p>
        </div>

        <CategorySwitcher categories={categories} active={category} onChange={setCategory} label="Editando categoría" />
        <MatchdaySelector matchdays={matchdays} value={selectedMatchday} onChange={setSelectedMatchday}/>

        {currentMatchday ? (
          <MatchList
            matches={currentMatchday.games}
            onChange={updatedMatch => {
              setIsDirty(true)
              setMatchdays(prev =>
                prev.map(md =>
                  md.id === currentMatchday.id
                    ? {
                        ...md,
                        games: md.games.map(m =>
                          m.id === updatedMatch.id ? updatedMatch : m
                        )
                      }
                    : md
                )
              )
            }}
            teams={teams}
            statsDraft={statsDraft}
            statsTotals={statsTotals}
            statsByMatch={statsByMatch}
            onAddStatEntry={addStatEntry}
            onRemoveStatEntry={removeStatEntry}
            onPlayerCreated={handlePlayerCreated}
            isReferee={isReferee}
          />
        ) : (
          <p className="matchday-editor-empty">
            Selecciona una jornada para registrar sus resultados
          </p>
        )}

        <div className="save-action">
          {saveSuccess && <span className="save-success">✓ Cambios guardados</span>}
          {!saveSuccess && !currentMatchday?.games?.length && (
            <span className="save-hint">Selecciona una jornada con partidos para poder guardar</span>
          )}
          <button
            className="save-button"
            onClick={handleSave}
            disabled={saving || !currentMatchday?.games?.length}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default EditMatchday
