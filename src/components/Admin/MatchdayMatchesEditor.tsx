import { useEffect, useState } from 'react'

import { useCategory } from '../../context/CategoryContext'
import { useLeague } from '../../context/LeagueContext'

import { getTeamsByCategoryId } from '../../services/team.service.js'
import { getBranchByLeagueId } from '../../services/branch.service.js'
import { getFieldByBranchId } from '../../services/field.service.js'

import TeamSelect from './TeamSelect'

import './MatchdayMatchesEditor.css'

function MatchdayMatchesEditor({ matchday }) {
  const { league } = useLeague()
  const { category } = useCategory()

  const [matches, setMatches] = useState([])

  const [teams, setTeams] = useState([])
  const [branches, setBranches] = useState([])
  const [fields, setFields] = useState([])

  const [loadingData, setLoadingData] = useState(false)
  const [loadingFields, setLoadingFields] = useState(false)

  const [timeError, setTimeError] = useState('')

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

        const branchesArray = branchData || []

        setTeams(teamsData || [])
        setBranches(branchesArray)

        // Auto–seleccionar primera sede
        setDraftMatch(prev => ({
          ...prev,
          branchId: branchesArray.length > 0 ? branchesArray[0].id : ''
        }))
      } catch (err) {
        console.error('Error cargando datos del formulario', err)
      } finally {
        setLoadingData(false)
      }
    }

    loadFormData()
  }, [category?.id, league?.id])

  /* =========================
     CARGAR CAMPOS POR SEDE
     ========================= */
  useEffect(() => {
    if (!draftMatch.branchId) {
      setFields([])
      setDraftMatch(prev => ({ ...prev, field: '' }))
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

        // Auto–seleccionar primer campo
        setDraftMatch(prev => ({
          ...prev,
          field: fieldsArray.length > 0 ? fieldsArray[0].id : ''
        }))
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
     ========================= */
  useEffect(() => {
    setMatches([])
    setDraftMatch({
      homeTeamId: '',
      awayTeamId: '',
      branchId: '',
      field: '',
      time: ''
    })
    setTimeError('')
  }, [matchday?.id])

  /* =========================
     AGREGAR PARTIDO
     ========================= */
  const handleAddMatch = () => {
    setTimeError('')

    if (
      !draftMatch.homeTeamId ||
      !draftMatch.awayTeamId ||
      !draftMatch.time ||
      String(draftMatch.homeTeamId) === String(draftMatch.awayTeamId)
    ) {
      return
    }

    const hasConflict = matches.some(match =>
      String(match.branchId) === String(draftMatch.branchId) &&
      String(match.field) === String(draftMatch.field) &&
      match.time === draftMatch.time
    )

    if (hasConflict) {
      setTimeError(
        `Los horarios de los partidos se traslapan`
      )
      return
    }

    setMatches(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...draftMatch
      }
    ])

    // Limpiar draft sin perder sede/campo
    setDraftMatch(prev => ({
      ...prev,
      homeTeamId: '',
      awayTeamId: '',
      time: ''
    }))
  }

  const handleRemoveMatch = (id) => {
    setMatches(prev => prev.filter(m => m.id !== id))
  }

  if (!matchday) {
    return (
      <div className="matches-editor empty">
        Selecciona o crea una jornada para agregar partidos
      </div>
    )
  }

  return (
    <div className="matches-editor">
      <h3>Partidos de la jornada</h3>

      {/* FORM SUPERIOR */}
      <div className="match-form">
        <TeamSelect
          teams={teams}
          value={draftMatch.homeTeamId}
          placeholder="Equipo local"
          onChange={(teamId) =>
            setDraftMatch(prev => ({ ...prev, homeTeamId: teamId }))
          }
        />

        <span className="vs">vs</span>

        <TeamSelect
          teams={teams}
          value={draftMatch.awayTeamId}
          placeholder="Equipo visitante"
          onChange={(teamId) =>
            setDraftMatch(prev => ({ ...prev, awayTeamId: teamId }))
          }
        />

        <select
          value={draftMatch.branchId}
          onChange={(e) =>
            setDraftMatch(prev => ({ ...prev, branchId: e.target.value }))
          }
          disabled={loadingData || branches.length === 0}
        >
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>

        <select
          value={draftMatch.field}
          onChange={(e) =>
            setDraftMatch(prev => ({ ...prev, field: e.target.value }))
          }
          disabled={!draftMatch.branchId || loadingFields}
        >
          {fields.map(field => (
            <option key={field.id} value={field.id}>
              {field.name}
            </option>
          ))}
        </select>

        {/* Hora + error UX */}
<div className="time-column">
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

  {timeError && (
    <div className="time-error">
      ⚠️ {timeError}
    </div>
  )}
</div>

<button
  type="button"
  className="add-match-btn"
  onClick={handleAddMatch}
>
  Agregar
</button>

      </div>

      {/* LISTA DE PARTIDOS */}
      <div className="matches-list">
        {matches.map((match, index) => {
          const homeTeam = teams.find(
            t => String(t.id) === String(match.homeTeamId)
          )
          const awayTeam = teams.find(
            t => String(t.id) === String(match.awayTeamId)
          )
          const branch = branches.find(
            b => String(b.id) === String(match.branchId)
          )
          const field = fields.find(
            f => String(f.id) === String(match.field)
          )

          return (
            <div key={match.id} className="match-row">
              <div className="match-teams">
                <div className="match-index">
                  Partido {index + 1}
                </div>

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
    </div>
  )
}

export default MatchdayMatchesEditor
