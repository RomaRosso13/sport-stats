import { useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useSeason } from '../../context/SeasonContext'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import ImageUploadField from '../../components/Admin/ImageUploadField'

import { updateLeague } from '../../services/league.service'
import { updateSeasonCalendarConfig } from '../../services/season.service'
import { compressImage } from '../../utils/compressImage'
import { uploadImage } from '../../services/storage.service'

import './ConfigManager.css'

const DEFAULT_CALENDAR_CONFIG = {
  startHour: 20,
  endHour: 24,
  stepMinutes: 15,
  matchDurationMinutes: 40
}

function ConfigManager() {
  const { league } = useLeague()
  const { seasons, season: activeSeason } = useSeason()

  // --- Liga: nombre, logo, color ---
  const [name, setName] = useState(league?.name || '')
  const [logoFile, setLogoFile] = useState(null)
  const [primaryColor, setPrimaryColor] = useState(league?.primary_color || '#2563eb')
  const [savingLeague, setSavingLeague] = useState(false)
  const [leagueLabel, setLeagueLabel] = useState('')
  const [leagueError, setLeagueError] = useState('')
  const [leagueSaved, setLeagueSaved] = useState(false)

  // --- Calendario por temporada ---
  const [selectedSeasonId, setSelectedSeasonId] = useState(activeSeason?.id || seasons[0]?.id || '')
  const selectedSeason = seasons.find(s => String(s.id) === String(selectedSeasonId)) || activeSeason

  const [startHour, setStartHour] = useState(selectedSeason?.start_hour ?? DEFAULT_CALENDAR_CONFIG.startHour)
  const [endHour, setEndHour] = useState(selectedSeason?.end_hour ?? DEFAULT_CALENDAR_CONFIG.endHour)
  const [stepMinutes, setStepMinutes] = useState(selectedSeason?.step_minutes ?? DEFAULT_CALENDAR_CONFIG.stepMinutes)
  const [matchDurationMinutes, setMatchDurationMinutes] = useState(
    selectedSeason?.match_duration_minutes ?? DEFAULT_CALENDAR_CONFIG.matchDurationMinutes
  )
  const [savingCalendar, setSavingCalendar] = useState(false)
  const [calendarError, setCalendarError] = useState('')
  const [calendarSaved, setCalendarSaved] = useState(false)

  function handleSeasonChange(seasonId) {
    setSelectedSeasonId(seasonId)
    const found = seasons.find(s => String(s.id) === String(seasonId))
    setStartHour(found?.start_hour ?? DEFAULT_CALENDAR_CONFIG.startHour)
    setEndHour(found?.end_hour ?? DEFAULT_CALENDAR_CONFIG.endHour)
    setStepMinutes(found?.step_minutes ?? DEFAULT_CALENDAR_CONFIG.stepMinutes)
    setMatchDurationMinutes(found?.match_duration_minutes ?? DEFAULT_CALENDAR_CONFIG.matchDurationMinutes)
    setCalendarSaved(false)
  }

  async function handleSaveLeague(e) {
    e.preventDefault()

    if (!name.trim()) {
      setLeagueError('El nombre de la liga es obligatorio')
      return
    }

    try {
      setSavingLeague(true)
      setLeagueError('')
      setLeagueSaved(false)

      let imageUrl = league?.image_url || ''

      if (logoFile) {
        setLeagueLabel('Optimizando imagen...')
        const compressed = await compressImage(logoFile, { maxWidth: 600, maxHeight: 600 })

        setLeagueLabel('Subiendo imagen...')
        imageUrl = await uploadImage(compressed, 'leagues')
      }

      setLeagueLabel('Guardando...')
      await updateLeague(league.id, { name: name.trim(), imageUrl, primaryColor })

      setLeagueSaved(true)
      // Recarga para que el Header/LeagueContext tomen el nombre, logo y color nuevos.
      window.location.reload()
    } catch (err) {
      console.error(err)
      setLeagueError(err.message || 'No se pudo guardar la configuración de la liga')
    } finally {
      setSavingLeague(false)
      setLeagueLabel('')
    }
  }

  async function handleSaveCalendar(e) {
    e.preventDefault()

    if (!selectedSeasonId) {
      setCalendarError('Selecciona una temporada')
      return
    }

    if (Number(startHour) >= Number(endHour)) {
      setCalendarError('La hora de inicio debe ser menor a la hora de fin')
      return
    }

    try {
      setSavingCalendar(true)
      setCalendarError('')
      setCalendarSaved(false)

      await updateSeasonCalendarConfig(selectedSeasonId, {
        startHour, endHour, stepMinutes, matchDurationMinutes
      })

      setCalendarSaved(true)
    } catch (err) {
      console.error(err)
      setCalendarError(err.message || 'No se pudo guardar la configuración del calendario')
    } finally {
      setSavingCalendar(false)
    }
  }

  return (
    <div className="app-layout">
      <Header league={league} />
      <main className="config-manager-container">
        <div className="config-manager-intro">
          <h2>Configuración General</h2>
          <p>Ajusta la identidad de tu liga y el calendario de partidos por temporada</p>
        </div>

        <section className="config-card">
          <h3>Liga</h3>

          <form onSubmit={handleSaveLeague}>
            <label>Nombre de la liga</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Experience Bowl"
            />

            <ImageUploadField
              label="Logo (encabezado)"
              currentUrl={league?.image_url}
              onFileSelected={setLogoFile}
            />

            <label>Color principal</label>
            <div className="color-field">
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
              />
              <input
                type="text"
                className="color-hex-input"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                placeholder="#2563eb"
              />
            </div>

            {leagueError && <p className="modal-error">{leagueError}</p>}
            {leagueSaved && <p className="config-success">✓ Guardado</p>}

            <div className="config-card-actions">
              <button type="submit" disabled={savingLeague}>
                {savingLeague ? leagueLabel : 'Guardar liga'}
              </button>
            </div>
          </form>
        </section>

        <section className="config-card">
          <h3>Calendario de partidos</h3>
          <p className="config-card-subtitle">
            Define el rango de horas y la duración de los partidos que se muestran en el calendario — es propio de cada temporada
          </p>

          <form onSubmit={handleSaveCalendar}>
            <label>Temporada</label>
            <select value={selectedSeasonId} onChange={e => handleSeasonChange(e.target.value)}>
              {seasons.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <div className="config-fields-row">
              <div className="config-field">
                <label>Hora de inicio</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={startHour}
                  onChange={e => setStartHour(e.target.value)}
                />
              </div>

              <div className="config-field">
                <label>Hora de fin</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={endHour}
                  onChange={e => setEndHour(e.target.value)}
                />
              </div>

              <div className="config-field">
                <label>Intervalo (min)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={stepMinutes}
                  onChange={e => setStepMinutes(e.target.value)}
                />
              </div>

              <div className="config-field">
                <label>Duración partido (min)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={matchDurationMinutes}
                  onChange={e => setMatchDurationMinutes(e.target.value)}
                />
              </div>
            </div>

            {calendarError && <p className="modal-error">{calendarError}</p>}
            {calendarSaved && <p className="config-success">✓ Guardado</p>}

            <div className="config-card-actions">
              <button type="submit" disabled={savingCalendar || !selectedSeasonId}>
                {savingCalendar ? 'Guardando...' : 'Guardar calendario'}
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ConfigManager
