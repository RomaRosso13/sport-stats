import { useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useSeason } from '../../context/SeasonContext'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'

import { updateSeasonCalendarConfig } from '../../services/season.service'

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
          <p>Ajusta el calendario de partidos por temporada</p>
        </div>

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
