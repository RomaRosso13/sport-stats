import { useEffect, useState } from 'react'

import { getActiveSeasonsByLeagueId } from '../../services/season.service'
import { getActiveCategoriesBySeasonId } from '../../services/category.service'
import { getTeamsByCategoryId, getTeamsByIds } from '../../services/team.service.js'

import './TeamMultiPicker.css'

const CATEGORY_LABELS = {
  Mixto: 'Mixto',
  Femenil: 'Femenil',
  Varonil: 'Varonil'
}

function TeamMultiPicker({ leagueId, value = [], onChange }) {
  const [seasons, setSeasons] = useState([])
  const [categories, setCategories] = useState([])
  const [teams, setTeams] = useState([])

  const [seasonId, setSeasonId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [knownTeams, setKnownTeams] = useState({})

  useEffect(() => {
    if (!leagueId) return

    async function loadSeasons() {
      const data = await getActiveSeasonsByLeagueId(leagueId)
      setSeasons(data || [])
    }

    loadSeasons()
  }, [leagueId])

  // Precarga los nombres de los equipos ya seleccionados (ej. al editar un
  // coach que ya tiene equipos) para poder mostrarlos como chip aunque el
  // admin no haya navegado a esa categoría todavía. Solo una vez.
  useEffect(() => {
    if (!value.length) return

    async function loadKnownTeams() {
      const data = await getTeamsByIds(value)
      setKnownTeams(prev => {
        const next = { ...prev }
        ;(data || []).forEach(t => { next[t.id] = t })
        return next
      })
    }

    loadKnownTeams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!seasonId) {
      setCategories([])
      setCategoryId('')
      return
    }

    async function loadCategories() {
      const data = await getActiveCategoriesBySeasonId(seasonId)
      setCategories(data || [])
    }

    loadCategories()
  }, [seasonId])

  useEffect(() => {
    if (!categoryId) {
      setTeams([])
      return
    }

    async function loadTeams() {
      const data = await getTeamsByCategoryId(categoryId)
      setTeams(data || [])

      // getTeamsByCategoryId no trae la categoría embebida (solo category_id) —
      // la tomamos de `categories`, que ya viene con `type`, para poder
      // mostrar "Equipo · Categoría" en los chips de seleccionados.
      const currentCategory = categories.find(c => String(c.id) === String(categoryId))
      setKnownTeams(prev => {
        const next = { ...prev }
        ;(data || []).forEach(t => {
          next[t.id] = { ...t, category: currentCategory ? { id: currentCategory.id, type: currentCategory.type } : t.category }
        })
        return next
      })
    }

    loadTeams()
  }, [categoryId, categories])

  function toggleTeam(team) {
    const exists = value.includes(team.id)
    onChange(exists ? value.filter(id => id !== team.id) : [...value, team.id])
  }

  function removeTeam(teamId) {
    onChange(value.filter(id => id !== teamId))
  }

  return (
    <div className="team-multi-picker">
      <label>Temporada</label>
      <select value={seasonId} onChange={e => setSeasonId(e.target.value)}>
        <option value="">Selecciona una temporada</option>
        {seasons.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <label>Categoría</label>
      <select value={categoryId} onChange={e => setCategoryId(e.target.value)} disabled={!seasonId}>
        <option value="">Selecciona una categoría</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{CATEGORY_LABELS[c.type] || c.type}</option>
        ))}
      </select>

      {categoryId && (
        teams.length === 0 ? (
          <p className="team-multi-picker-empty">Esta categoría aún no tiene equipos</p>
        ) : (
          <div className="team-multi-picker-checklist">
            {teams.map(team => (
              <label key={team.id} className="team-multi-picker-option">
                <input
                  type="checkbox"
                  checked={value.includes(team.id)}
                  onChange={() => toggleTeam(team)}
                />
                <span>{team.name}</span>
              </label>
            ))}
          </div>
        )
      )}

      {value.length > 0 && (
        <div className="team-multi-picker-selected">
          <span className="team-multi-picker-selected-label">Equipos seleccionados</span>
          <div className="team-multi-picker-chips">
            {value.map(id => {
              const team = knownTeams[id]
              const categoryType = team?.category?.type
              return (
                <span key={id} className="team-multi-picker-chip">
                  <span className="team-multi-picker-chip-name">{team?.name || `Equipo #${id}`}</span>
                  {categoryType && (
                    <span className="team-multi-picker-chip-category">
                      {CATEGORY_LABELS[categoryType] || categoryType}
                    </span>
                  )}
                  <button type="button" onClick={() => removeTeam(id)} aria-label="Quitar equipo">×</button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamMultiPicker
