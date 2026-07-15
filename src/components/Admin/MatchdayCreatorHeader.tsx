import { useEffect, useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useCategory } from '../../context/CategoryContext'
import { useSeason } from '../../context/SeasonContext'

import { getMatchDaysByCategoryIds, createMatchdayForCategories } from '../../services/matchday.service.js'

import './MatchdayCreatorHeader.css'

const CATEGORY_LABELS = {
  Mixto: 'Mixto',
  Femenil: 'Femenil',
  Varonil: 'Varonil'
}

// Cada jornada es compartida por todas las categorías activas de la
// temporada: se agrupan los renglones de Matchday (uno por categoría) que
// caen en la misma fecha, para tratarlos como una sola jornada en la UI.
function groupMatchdaysByDate(matchdaysData) {
  const byDate = new Map()

  matchdaysData.forEach(md => {
    if (!byDate.has(md.date)) {
      byDate.set(md.date, { id: md.date, date: md.date, name: md.name, matchdaysByCategory: {} })
    }
    byDate.get(md.date).matchdaysByCategory[md.category_id] = md
  })

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function MatchdayCreatorHeader({ selectedMatchday, setSelectedMatchday }) {
  const { league, loading: leagueLoading } = useLeague()
  const { categories, loading: categoriesLoading } = useCategory()
  const { season, loading: seasonLoading } = useSeason()

  const [matchdays, setMatchdays] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  /* Cargar jornadas compartidas por todas las categorías activas */
  useEffect(() => {
    if (!categories || categories.length === 0) {
      setMatchdays([])
      return
    }

    async function loadMatchdays() {
      const categoryIds = categories.map(cat => cat.id)
      const data = await getMatchDaysByCategoryIds(categoryIds)
      setMatchdays(groupMatchdaysByDate(data || []))
    }

    loadMatchdays()
  }, [categories])

  /* Seleccionar la primera jornada disponible, o forzar la creación de una */
  useEffect(() => {
    if (!categories || categories.length === 0) return

    if (matchdays.length === 0) {
      setSelectedMatchday({
        id: 'new',
        number: 1,
        name: '',
        date: '',
        isDraft: true
      })
    } else {
      setSelectedMatchday(matchdays[0])
    }
  }, [matchdays, categories])

  const isNew = selectedMatchday?.id === 'new'
  const canCreate =
    isNew &&
    selectedMatchday.name?.trim() &&
    selectedMatchday.date &&
    categories.length > 0

  const handleCreateMatchday = async () => {
    if (!canCreate) return

    try {
      setIsSaving(true)

      const categoryIds = categories.map(cat => cat.id)
      const createdRows = await createMatchdayForCategories(
        selectedMatchday.name,
        selectedMatchday.date,
        categoryIds
      )

      const matchdaysByCategory = {}
      createdRows.forEach(row => { matchdaysByCategory[row.category_id] = row })

      const newJornada = {
        id: selectedMatchday.date,
        date: selectedMatchday.date,
        name: selectedMatchday.name,
        matchdaysByCategory
      }

      setMatchdays(prev => [...prev, newJornada])
      setSelectedMatchday(newJornada)

    } catch (err) {
      console.error('Error creando jornada', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="matchday-header">
      <div className="context-group readonly">
        <div className="context-pill">
          <span className="label">Liga</span>
          <span className="value">
            {leagueLoading ? 'Cargando...' : league?.name}
          </span>
        </div>

        <div className="context-pill">
          <span className="label">Temporada</span>
          <span className="value">
            {seasonLoading ? 'Cargando...' : season?.name || 'Sin temporada'}
          </span>
        </div>
      </div>

      <div className="context-group">
        {/* Jornada (compartida por todas las categorías activas) */}
        <div className="context-field">
          <label>Jornada</label>
          <select
            value={selectedMatchday ? String(selectedMatchday.id) : ''}
            onChange={(e) => {
              const value = e.target.value

              if (value === 'new') {
                setSelectedMatchday({
                  id: 'new',
                  number: matchdays.length + 1,
                  name: '',
                  date: '',
                  isDraft: true
                })
                return
              }

              const existing = matchdays.find(
                md => String(md.id) === value
              )

              if (existing) {
                setSelectedMatchday(existing)
              }
            }}
            disabled={categoriesLoading || categories.length === 0}
          >
            {matchdays.map(md => (
              <option key={md.id} value={String(md.id)}>
                {md.name}
              </option>
            ))}
            <option value="new">+ Crear nueva jornada</option>
          </select>
        </div>

        {!isNew && selectedMatchday && (
          <span className="matchday-status">
            ✓ {selectedMatchday.name}
            {selectedMatchday.date && ` · ${selectedMatchday.date}`}
          </span>
        )}
      </div>

      {/* Panel de nueva jornada */}
      {isNew && (
        <div className="new-matchday-panel">
          <span className="new-matchday-panel-title">Nueva jornada</span>
          <span className="new-matchday-panel-hint">
            Estará disponible para: {categories.map(cat => CATEGORY_LABELS[cat.type] || cat.type).join(', ')}
          </span>

          <div className="context-field">
            <label>
              Nombre <span className="required">*</span>
            </label>
            <input
              type="text"
              value={selectedMatchday.name}
              placeholder="Ej. Jornada 5 / Cuartos de final"
              onChange={(e) =>
                setSelectedMatchday(prev => ({
                  ...prev,
                  name: e.target.value
                }))
              }
            />
          </div>

          <div className="context-field">
            <label>
              Fecha <span className="required">*</span>
            </label>
            <input
              type="date"
              value={selectedMatchday?.date || ''}
              onChange={(e) =>
                setSelectedMatchday(prev => ({
                  ...prev,
                  date: e.target.value
                }))
              }
            />
          </div>

          <div className="context-field">
            <label>&nbsp;</label>
            <button
              className="create-matchday-btn"
              onClick={handleCreateMatchday}
              disabled={!canCreate || isSaving}
            >
              {isSaving ? 'Creando...' : 'Crear jornada'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchdayCreatorHeader
