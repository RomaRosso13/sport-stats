import { useEffect, useState } from 'react'

import { useCategory } from '../../context/CategoryContext'
import { useLeague } from '../../context/LeagueContext'

import { getTeamsByCategoryId } from '../../services/team.service.js'
import { getBranchByLeagueId } from '../../services/branch.service.js'
import { getFieldByBranchId } from '../../services/field.service.js'

import TeamSelect from './TeamSelect'

import './MatchdayMatchesEditor.css'

function MatchdayMatchesEditor({ matchday, matches, setMatches }) {
  const { league } = useLeague()
  const { category } = useCategory()

  const [teams, setTeams] = useState([])
  const [branches, setBranches] = useState([])
  const [fields, setFields] = useState([])

  const [loadingData, setLoadingData] = useState(false)
  const [loadingFields, setLoadingFields] = useState(false)

  const [formError, setFormError] = useState('')

  const [draftMatch, setDraftMatch] = useState({
    homeTeamId: '',
    awayTeamId: '',
    branchId: '',
    field: '',
    time: ''
  })

  /* =========================
     CARGAR EQUIPOS Y SEDES
     ========================= */
  useEffect(() => {
    if (!category || !league) return

    async function loadFormData() {
      try {
        setLoadingData(true)

        const [teamsData, branchData] = await Promise.all([
          getTeamsByCategoryId(category.id),
          getBranchByLeagueId(league.id)
        ])

        setTeams(teamsData || [])
        setBranches(branchData || [])
      } catch (err) {
        console.error('Error cargando datos del formulario', err)
      } finally {
        setLoadingData(false)
      }
    }

    loadFormData()
  }, [category?.id, league?.id])

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

    setDraftMatch(prev => ({
      ...prev,
    }))
  }, [matchday?.id])

  /* =========================
     AGREGAR PARTIDO
     ========================= */
  const handleAddMatch = () => {
    setFormError('')

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
        ...draftMatch
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

  if (!matchday) {
    return (
      <div className="matches-editor-empty">
        Selecciona o crea una jornada para agregar partidos
      </div>
    )
  }

  return (
    <div className="matches-editor">
      <h3>Agregar partido</h3>
      <p className="matches-editor-subtitle">
        Completa los datos del partido y presiona "Agregar" para sumarlo a la lista de abajo.
      </p>

      <div className="match-form">
        <div className="match-form-row teams-row">
          <div className="field-group">
            <label>Equipo local</label>
            <TeamSelect
              teams={teams}
              value={draftMatch.homeTeamId}
              placeholder="Selecciona un equipo"
              onChange={(teamId) =>
                setDraftMatch(prev => ({ ...prev, homeTeamId: teamId }))
              }
            />
          </div>

          <span className="vs">vs</span>

          <div className="field-group">
            <label>Equipo visitante</label>
            <TeamSelect
              teams={teams}
              value={draftMatch.awayTeamId}
              placeholder="Selecciona un equipo"
              onChange={(teamId) =>
                setDraftMatch(prev => ({ ...prev, awayTeamId: teamId }))
              }
            />
          </div>
        </div>

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

          <div className="field-group add-match-group">
            <label>&nbsp;</label>
            <button
              type="button"
              className="add-match-btn"
              onClick={handleAddMatch}
            >
              + Agregar
            </button>
          </div>
        </div>
      </div>

      {formError && (
        <div className="form-error">⚠️ {formError}</div>
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

          return (
            <div key={match.id} className="match-row">
              <div className="match-teams">
                <div className="match-index">Partido {index + 1}</div>

                <div className="team">
                  {homeTeam?.logo_url && (
                    <img src={homeTeam.logo_url} alt={homeTeam.name} />
                  )}
                  <span>{homeTeam?.name}</span>
                </div>

                <span className="vs">vs</span>

                <div className="team">
                  {awayTeam?.logo_url && (
                    <img src={awayTeam.logo_url} alt={awayTeam.name} />
                  )}
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
