import { useEffect, useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useCategory } from '../../context/CategoryContext'
import { useSeason } from '../../context/SeasonContext'

import { getMatchDaysByCategoryId, createMatchday } from '../../services/matchday.service.js'

import './MatchdayCreatorHeader.css'

function MatchdayCreatorHeader({ selectedMatchday, setSelectedMatchday }) {
  const { league, loading: leagueLoading } = useLeague()
  const { categories, category, setCategory, categoryLoading } = useCategory()
  const { season, loading: seasonLoading } = useSeason()

  const [matchdays, setMatchdays] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  /* Cargar jornadas por categoría */
  useEffect(() => {
    if (!category) return

    async function loadMatchdays() {
      const data = await getMatchDaysByCategoryId(category.id)
      setMatchdays(data || [])
    }

    loadMatchdays()
  }, [category?.id])

  /* Resetear jornada al cambiar categoría */
  useEffect(() => {
    if (!category) return

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
  }, [matchdays, category?.id])


  /* Si no hay jornadas, forzar creación */
  useEffect(() => {
    if (!category) return

    if (matchdays.length === 0) {
      setSelectedMatchday({
        id: 'new',
        number: 1,
        name: '',
        date: '',
        isDraft: true
      })
    }
  }, [matchdays, category])

  const isNew = selectedMatchday?.id === 'new'
  const canCreate =
    isNew &&
    selectedMatchday.name?.trim() &&
    selectedMatchday.date

  const handleCreateMatchday = async () => {
    if (!canCreate) return

    try {
      setIsSaving(true)

      const newMatchday = await createMatchday(selectedMatchday.name, selectedMatchday.date, category.id)

      setMatchdays(prev => [...prev, newMatchday])
      setSelectedMatchday(newMatchday)

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
        {/* Categoría */}
        <div className="context-field">
          <label>Categoría</label>
          <select
            value={category ? String(category.id) : ''}
            onChange={(e) => {
              const selected = categories.find(
                cat => String(cat.id) === e.target.value
              )
              if (selected) setCategory(selected)
            }}
            disabled={categoryLoading || categories.length === 0}
          >
            {categories.map(cat => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.type}
              </option>
            ))}
          </select>
        </div>

        {/* Jornada */}
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
            disabled={!category}
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
