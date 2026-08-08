import { useEffect, useState } from 'react'

import { useCategory } from '../../context/CategoryContext'
import { useLeague } from '../../context/LeagueContext'
import { useConfirm } from '../../context/ConfirmContext'
import { useToast } from '../../context/ToastContext'

import { getTeamsByCategoryIds } from '../../services/team.service.js'
import { getBranchByLeagueId } from '../../services/branch.service.js'
import { getFieldByBranchId } from '../../services/field.service.js'
import { getMatchDaysByCategoryIds } from '../../services/matchday.service.js'
import { getMatchesByMatchDayIds, updateMatchDetails, deleteMatch } from '../../services/match.service.js'

import { STAGE_OPTIONS, STAGE_LABELS } from '../../utils/matchStages'

import TeamSelect from './TeamSelect'
import MatchupHelper from './MatchupHelper'
import TeamLogo from '../common/TeamLogo'

import './MatchdayMatchesEditor.css'

const CATEGORY_LABELS = {
  Mixto: 'Mixto',
  Femenil: 'Femenil',
  Varonil: 'Varonil'
}

function MatchdayMatchesEditor({ matchday, matches, setMatches, reloadToken }) {
  const { league } = useLeague()
  const { categories } = useCategory()
  const confirm = useConfirm()
  const toast = useToast()

  const [teams, setTeams] = useState([])
  const [branches, setBranches] = useState([])
  const [fields, setFields] = useState([])
  const [categoryMatches, setCategoryMatches] = useState([])

  const [loadingData, setLoadingData] = useState(false)
  const [loadingFields, setLoadingFields] = useState(false)

  const [formError, setFormError] = useState('')

  const [draftMatch, setDraftMatch] = useState({
    categoryId: '',
    homeTeamId: '',
    awayTeamId: '',
    branchId: '',
    field: '',
    time: '',
    type: 'Regular'
  })

  const [editingMatchId, setEditingMatchId] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  /* =========================
     CARGAR EQUIPOS, SEDES Y HISTORIAL DE PARTIDOS
     (de TODAS las categorías activas, ya que una jornada es compartida)
     ========================= */
  useEffect(() => {
    if (!categories || categories.length === 0 || !league) return

    async function loadFormData() {
      try {
        setLoadingData(true)

        const categoryIds = categories.map(cat => cat.id)

        const [teamsData, branchData, matchdaysData] = await Promise.all([
          getTeamsByCategoryIds(categoryIds),
          getBranchByLeagueId(league.id),
          getMatchDaysByCategoryIds(categoryIds)
        ])

        setTeams(teamsData || [])
        setBranches(branchData || [])

        const matchdayCategoryById = new Map()
        ;(matchdaysData || []).forEach(md => matchdayCategoryById.set(md.id, md.category_id))

        const matchdayIds = (matchdaysData || []).map(md => md.id)
        const matchesData = matchdayIds.length
          ? await getMatchesByMatchDayIds(matchdayIds)
          : []

        setCategoryMatches(
          (matchesData || []).map(m => ({ ...m, category_id: matchdayCategoryById.get(m.matchday_id) }))
        )
      } catch (err) {
        console.error('Error cargando datos del formulario', err)
      } finally {
        setLoadingData(false)
      }
    }

    loadFormData()
  }, [categories, league?.id, reloadToken])

  // Equipos disponibles para la categoría elegida en el partido que se está armando
  // — un equipo desactivado ya no es elegible para partidos nuevos.
  const categoryTeams = teams.filter(t => t.active !== false && String(t.category_id) === String(draftMatch.categoryId))

  // Partidos ya guardados de ESTA jornada (cualquier categoría) que aún no
  // terminan, para poder corregirlos si hubo un error al crearlos.
  const currentJornadaMatchdayIds = matchday?.matchdaysByCategory
    ? Object.keys(matchday.matchdaysByCategory).map(catId => matchday.matchdaysByCategory[catId].id)
    : []

  const existingMatches = categoryMatches.filter(m =>
    currentJornadaMatchdayIds.includes(m.matchday_id) && m.status !== 'Terminado'
  )

  // Partidos ya guardados en la BD + los que se llevan agregados en esta
  // sesión (aún sin guardar), filtrados a la categoría del partido en curso,
  // para que la ayuda de rivales no sugiera un enfrentamiento que ya se
  // acaba de armar pero todavía no se ha guardado.
  const allKnownMatches = [
    ...categoryMatches
      .filter(m => String(m.category_id) === String(draftMatch.categoryId))
      .map(m => ({ local_team_id: m.local_team_id, visit_team_id: m.visit_team_id })),
    ...matches
      .filter(m => String(m.categoryId) === String(draftMatch.categoryId))
      .map(m => ({ local_team_id: m.homeTeamId, visit_team_id: m.awayTeamId }))
  ]

  /* =========================
     AUTO–SELECCIONAR SEDE (solo si no hay)
     ========================= */
  useEffect(() => {
    if (!branches.length) return

    setDraftMatch(prev => {
      if (prev.branchId) return prev
      return {
        ...prev,
        branchId: branches[0].id
      }
    })
  }, [branches])

  /* =========================
     CARGAR CAMPOS POR SEDE
     ========================= */
  useEffect(() => {
    if (!draftMatch.branchId) {
      setFields([])
      return
    }

    let isMounted = true

    async function loadFields() {
      try {
        setLoadingFields(true)

        const fieldData = await getFieldByBranchId(draftMatch.branchId)
        const fieldsArray = fieldData || []

        if (!isMounted) return

        setFields(fieldsArray)

        setDraftMatch(prev => {
          if (prev.field) return prev
          return {
            ...prev,
            field: fieldsArray.length > 0 ? fieldsArray[0].id : ''
          }
        })
      } catch (err) {
        console.error('Error cargando campos', err)
      } finally {
        if (isMounted) setLoadingFields(false)
      }
    }

    loadFields()

    return () => {
      isMounted = false
    }
  }, [draftMatch.branchId])

  /* =========================
     RESET AL CAMBIAR JORNADA
     (SIN PERDER CONTEXTO)
     ========================= */
  useEffect(() => {
    if (!matchday) return

    setMatches([])
    setFormError('')
    setEditingMatchId(null)

    setDraftMatch(prev => ({
      ...prev,
    }))
  }, [matchday?.id])

  /* =========================
     AGREGAR PARTIDO
     ========================= */
  const handleAddMatch = () => {
    setFormError('')

    if (!draftMatch.categoryId) {
      setFormError('Selecciona la categoría del partido')
      return
    }

    if (!draftMatch.homeTeamId || !draftMatch.awayTeamId) {
      setFormError('Selecciona el equipo local y el visitante')
      return
    }

    if (String(draftMatch.homeTeamId) === String(draftMatch.awayTeamId)) {
      setFormError('El equipo local y el visitante deben ser diferentes')
      return
    }

    if (!draftMatch.branchId || !draftMatch.field) {
      setFormError('Selecciona la sede y la cancha')
      return
    }

    if (!draftMatch.time) {
      setFormError('Selecciona la hora del partido')
      return
    }

    const matchdayForCategory = matchday?.matchdaysByCategory?.[draftMatch.categoryId]
    if (!matchdayForCategory) {
      setFormError('Esta categoría no tiene una jornada creada para esta fecha')
      return
    }

    const hasConflict = matches.some(match =>
      String(match.branchId) === String(draftMatch.branchId) &&
      String(match.field) === String(draftMatch.field) &&
      match.time === draftMatch.time
    )

    if (hasConflict) {
      setFormError('Ya hay un partido en esa cancha a esa hora')
      return
    }

    setMatches(prev => [
      ...prev,
      {
        id: window.crypto.randomUUID(),
        ...draftMatch,
        matchdayId: matchdayForCategory.id,
        date: matchday.date
      }
    ])

    setDraftMatch(prev => ({
      ...prev,
      time: '' // solo limpiamos la hora
    }))
  }

  const handleRemoveMatch = (id) => {
    setMatches(prev => prev.filter(m => m.id !== id))
  }

  // Categoría a la que pertenece un matchday_id ya existente, según el mapa
  // de la jornada seleccionada (cada categoría tiene su propio renglón).
  function categoryIdForMatchday(matchdayId) {
    if (!matchday?.matchdaysByCategory) return ''
    const catId = Object.keys(matchday.matchdaysByCategory)
      .find(key => matchday.matchdaysByCategory[key].id === matchdayId)
    return catId || ''
  }

  function handleEditExisting(match) {
    setFormError('')
    setEditingMatchId(match.id)
    setDraftMatch({
      categoryId: categoryIdForMatchday(match.matchday_id),
      homeTeamId: match.local_team_id,
      awayTeamId: match.visit_team_id,
      branchId: match.branch_id,
      field: match.field_id,
      time: (match.hour || '').slice(0, 5),
      type: match.type || 'Regular'
    })
  }

  function handleCancelEdit() {
    setEditingMatchId(null)
    setFormError('')
    setDraftMatch(prev => ({
      ...prev,
      categoryId: '',
      homeTeamId: '',
      awayTeamId: '',
      time: ''
    }))
  }

  async function handleUpdateMatch() {
    setFormError('')

    if (!draftMatch.categoryId) {
      setFormError('Selecciona la categoría del partido')
      return
    }

    if (!draftMatch.homeTeamId || !draftMatch.awayTeamId) {
      setFormError('Selecciona el equipo local y el visitante')
      return
    }

    if (String(draftMatch.homeTeamId) === String(draftMatch.awayTeamId)) {
      setFormError('El equipo local y el visitante deben ser diferentes')
      return
    }

    if (!draftMatch.branchId || !draftMatch.field) {
      setFormError('Selecciona la sede y la cancha')
      return
    }

    if (!draftMatch.time) {
      setFormError('Selecciona la hora del partido')
      return
    }

    const matchdayForCategory = matchday?.matchdaysByCategory?.[draftMatch.categoryId]
    if (!matchdayForCategory) {
      setFormError('Esta categoría no tiene una jornada creada para esta fecha')
      return
    }

    try {
      setSavingEdit(true)

      const updated = await updateMatchDetails(editingMatchId, {
        homeTeamId: draftMatch.homeTeamId,
        awayTeamId: draftMatch.awayTeamId,
        branchId: draftMatch.branchId,
        field: draftMatch.field,
        time: draftMatch.time,
        type: draftMatch.type,
        matchdayId: matchdayForCategory.id
      })

      setCategoryMatches(prev => prev.map(m =>
        m.id === updated.id ? { ...updated, category_id: Number(draftMatch.categoryId) } : m
      ))

      handleCancelEdit()
    } catch (err) {
      console.error('Error actualizando el partido', err)
      setFormError('No se pudo guardar el partido')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDeleteExisting(match) {
    const homeName = match.local_team?.name || 'Local'
    const awayName = match.visit_team?.name || 'Visitante'

    const ok = await confirm({
      message: `¿Eliminar el partido ${homeName} vs ${awayName}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true
    })
    if (!ok) return

    try {
      setDeletingId(match.id)
      await deleteMatch(match.id)

      setCategoryMatches(prev => prev.filter(m => m.id !== match.id))

      if (String(editingMatchId) === String(match.id)) {
        handleCancelEdit()
      }
    } catch (err) {
      console.error('Error eliminando el partido', err)
      toast.error('No se pudo eliminar el partido')
    } finally {
      setDeletingId(null)
    }
  }

  // El equipo de referencia para la ayuda de rivales es el local si ya se
  // eligió; si no, cae al visitante. Elegir una sugerencia llena el otro campo.
  const referenceIsHome = !!draftMatch.homeTeamId
  const referenceTeamId = referenceIsHome ? draftMatch.homeTeamId : draftMatch.awayTeamId

  function handleSelectOpponent(teamId) {
    setDraftMatch(prev => referenceIsHome
      ? { ...prev, awayTeamId: teamId }
      : { ...prev, homeTeamId: teamId }
    )
  }

  if (!matchday) {
    return (
      <div className="matches-editor-empty">
        Selecciona o crea una jornada para agregar partidos
      </div>
    )
  }

  const isEditing = !!editingMatchId

  return (
    <div className="matches-editor">
      <h3>{isEditing ? 'Editar partido' : 'Agregar partido'}</h3>
      <p className="matches-editor-subtitle">
        {isEditing
          ? 'Corrige los datos del partido y presiona "Guardar cambios".'
          : 'Completa los datos del partido y presiona "Agregar" para sumarlo a la lista de abajo. Esta jornada es compartida por todas las categorías: cada partido lleva la suya propia.'}
      </p>

      <div className={`match-form ${isEditing ? 'editing' : ''}`}>
        <div className="match-form-row teams-row">
          <div className="field-group category-group">
            <label>Categoría</label>
            <select
              value={draftMatch.categoryId}
              onChange={(e) =>
                setDraftMatch(prev => ({
                  ...prev,
                  categoryId: e.target.value,
                  homeTeamId: '',
                  awayTeamId: ''
                }))
              }
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {CATEGORY_LABELS[cat.type] || cat.type}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Equipo local</label>
            <TeamSelect
              teams={categoryTeams}
              value={draftMatch.homeTeamId}
              placeholder="Selecciona un equipo"
              disabled={!draftMatch.categoryId}
              onChange={(teamId) =>
                setDraftMatch(prev => ({ ...prev, homeTeamId: teamId }))
              }
            />
          </div>

          <span className="vs">vs</span>

          <div className="field-group">
            <label>Equipo visitante</label>
            <TeamSelect
              teams={categoryTeams}
              value={draftMatch.awayTeamId}
              placeholder="Selecciona un equipo"
              disabled={!draftMatch.categoryId}
              onChange={(teamId) =>
                setDraftMatch(prev => ({ ...prev, awayTeamId: teamId }))
              }
            />
          </div>
        </div>

        <MatchupHelper
          teams={categoryTeams}
          matches={allKnownMatches}
          teamId={referenceTeamId}
          onSelectOpponent={handleSelectOpponent}
        />

        <div className="match-form-row details-row">
          <div className="field-group">
            <label>Sede</label>
            <select
              value={draftMatch.branchId}
              onChange={(e) =>
                setDraftMatch(prev => ({ ...prev, branchId: e.target.value, field: '' }))
              }
              disabled={loadingData || !branches.length}
            >
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Cancha</label>
            <select
              value={draftMatch.field}
              onChange={(e) =>
                setDraftMatch(prev => ({ ...prev, field: e.target.value }))
              }
              disabled={!fields.length || loadingFields}
            >
              {fields.length === 0 && <option value="">Sin canchas</option>}
              {fields.map(field => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Hora</label>
            <input
              type="time"
              value={draftMatch.time}
              onChange={(e) =>
                setDraftMatch(prev => ({
                  ...prev,
                  time: e.target.value
                }))
              }
            />
          </div>

          <div className="field-group">
            <label>Fase</label>
            <select
              value={draftMatch.type}
              onChange={(e) =>
                setDraftMatch(prev => ({ ...prev, type: e.target.value }))
              }
            >
              {STAGE_OPTIONS.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group add-match-group">
            <label>&nbsp;</label>
            {isEditing ? (
              <div className="edit-match-actions">
                <button
                  type="button"
                  className="add-match-btn"
                  onClick={handleUpdateMatch}
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={handleCancelEdit}
                  disabled={savingEdit}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="add-match-btn"
                onClick={handleAddMatch}
              >
                + Agregar
              </button>
            )}
          </div>
        </div>
      </div>

      {formError && (
        <div className="form-error">⚠️ {formError}</div>
      )}

      {existingMatches.length > 0 && (
        <>
          <h3 className="matches-list-title">
            Partidos sin terminar de esta jornada ({existingMatches.length})
          </h3>
          <p className="matches-editor-subtitle">
            Ya están guardados. Puedes editarlos si hubo algún error al crearlos.
          </p>

          <div className="matches-list">
            {existingMatches.map(match => {
              const matchCategoryId = categoryIdForMatchday(match.matchday_id)
              const matchCategory = categories.find(cat => String(cat.id) === String(matchCategoryId))

              return (
                <div key={match.id} className={`match-row ${String(editingMatchId) === String(match.id) ? 'editing' : ''}`}>
                  <div className="match-teams">
                    {matchCategory && (
                      <span className={`category-tag cat-${(matchCategory.type || '').toLowerCase()}`}>
                        {CATEGORY_LABELS[matchCategory.type] || matchCategory.type}
                      </span>
                    )}

                    {match.type && match.type !== 'Regular' && (
                      <span className="match-stage-badge">{STAGE_LABELS[match.type]}</span>
                    )}

                    <div className="team">
                      <TeamLogo logoUrl={match.local_team?.logo_url} name={match.local_team?.name} alt={match.local_team?.name} className="team-logo" />
                      <span>{match.local_team?.name}</span>
                    </div>

                    <span className="vs">vs</span>

                    <div className="team">
                      <TeamLogo logoUrl={match.visit_team?.logo_url} name={match.visit_team?.name} alt={match.visit_team?.name} className="team-logo" />
                      <span>{match.visit_team?.name}</span>
                    </div>
                  </div>

                  <div className="match-info">
                    <span>{match.branch?.name}</span>
                    <span>{match.field?.name}</span>
                    <span>{(match.hour || '').slice(0, 5)}</span>
                    <span className={`status-pill ${match.status === 'Por aprobar' ? 'review' : 'pending'}`}>
                      {match.status}
                    </span>
                  </div>

                  <div className="existing-match-actions">
                    <button
                      type="button"
                      className="edit-match-btn"
                      onClick={() => handleEditExisting(match)}
                      disabled={deletingId === match.id}
                    >
                      Editar
                    </button>

                    {match.status === 'Pendiente' && (
                      <button
                        type="button"
                        className="delete-match-btn"
                        onClick={() => handleDeleteExisting(match)}
                        disabled={deletingId === match.id}
                      >
                        {deletingId === match.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <h3 className="matches-list-title">
        Partidos agregados {matches.length > 0 && `(${matches.length})`}
      </h3>

      {matches.length === 0 ? (
        <p className="matches-list-empty">
          Aún no has agregado ningún partido a esta jornada
        </p>
      ) : (
      <div className="matches-list">
        {matches.map((match, index) => {
          const homeTeam = teams.find(t => String(t.id) === String(match.homeTeamId))
          const awayTeam = teams.find(t => String(t.id) === String(match.awayTeamId))
          const branch = branches.find(b => String(b.id) === String(match.branchId))
          const field = fields.find(f => String(f.id) === String(match.field))
          const matchCategory = categories.find(cat => String(cat.id) === String(match.categoryId))

          return (
            <div key={match.id} className="match-row">
              <div className="match-teams">
                <div className="match-index">Partido {index + 1}</div>

                {matchCategory && (
                  <span className={`category-tag cat-${(matchCategory.type || '').toLowerCase()}`}>
                    {CATEGORY_LABELS[matchCategory.type] || matchCategory.type}
                  </span>
                )}

                {match.type && match.type !== 'Regular' && (
                  <span className="match-stage-badge">{STAGE_LABELS[match.type]}</span>
                )}

                <div className="team">
                  <TeamLogo logoUrl={homeTeam?.logo_url} name={homeTeam?.name} alt={homeTeam?.name} className="team-logo" />
                  <span>{homeTeam?.name}</span>
                </div>

                <span className="vs">vs</span>

                <div className="team">
                  <TeamLogo logoUrl={awayTeam?.logo_url} name={awayTeam?.name} alt={awayTeam?.name} className="team-logo" />
                  <span>{awayTeam?.name}</span>
                </div>
              </div>

              <div className="match-info">
                <span>{branch?.name}</span>
                <span>{field?.name}</span>
                <span>{match.time}</span>
              </div>

              <button
                type="button"
                className="remove-match-btn"
                onClick={() => handleRemoveMatch(match.id)}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}

export default MatchdayMatchesEditor
