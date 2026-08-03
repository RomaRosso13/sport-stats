import { useEffect, useState } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useSeason } from '../../context/SeasonContext'
import { useLeagueMembership } from '../../hooks/useLeagueMembership'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'

import { updateSeasonCalendarConfig } from '../../services/season.service'
import { updateLeagueStatLabels, updateLeagueMembershipDate } from '../../services/league.service'
import { getPlatformSettings, updatePlatformReleaseNotes } from '../../services/platform_settings.service'
import { getHeroImagesByLeagueId, addHeroImage, deleteHeroImage } from '../../services/league_hero_image.service'
import { uploadImage } from '../../services/storage.service'
import { compressImage } from '../../utils/compressImage'
import { STAT_KEYS, DEFAULT_STAT_LABELS, getStatLabels } from '../../constants/statFields'

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
  const { isSuperAdmin, isFullAdmin } = useLeagueMembership()

  // --- Membresía de la liga (solo SuperAdmin) ---
  const [membershipDate, setMembershipDate] = useState(league?.membership_valid_until || '')
  const [savingMembership, setSavingMembership] = useState(false)
  const [membershipError, setMembershipError] = useState('')
  const [membershipSaved, setMembershipSaved] = useState(false)

  async function handleSaveMembership(e) {
    e.preventDefault()

    try {
      setSavingMembership(true)
      setMembershipError('')
      setMembershipSaved(false)

      await updateLeagueMembershipDate(league.id, membershipDate)

      setMembershipSaved(true)
    } catch (err) {
      console.error(err)
      setMembershipError(err.message || 'No se pudo guardar la fecha de membresía')
    } finally {
      setSavingMembership(false)
    }
  }

  // --- Carrusel de fotos en Inicio (Admin y SuperAdmin) ---
  const [heroImages, setHeroImages] = useState([])
  const [uploadingHero, setUploadingHero] = useState(false)
  const [heroError, setHeroError] = useState('')
  const [deletingHeroId, setDeletingHeroId] = useState(null)

  useEffect(() => {
    if (!league?.id) return

    async function loadHeroImages() {
      try {
        const images = await getHeroImagesByLeagueId(league.id)
        setHeroImages(images || [])
      } catch (err) {
        console.error(err)
      }
    }

    loadHeroImages()
  }, [league?.id])

  async function handleHeroFilesSelected(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    try {
      setUploadingHero(true)
      setHeroError('')

      for (const file of files) {
        const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 900, quality: 0.82 })
        const url = await uploadImage(compressed, 'league-hero')
        const saved = await addHeroImage(league.id, url)
        setHeroImages(prev => [...prev, saved])
      }
    } catch (err) {
      console.error(err)
      setHeroError(err.message || 'No se pudieron subir una o más imágenes')
    } finally {
      setUploadingHero(false)
    }
  }

  async function handleDeleteHeroImage(id) {
    try {
      setDeletingHeroId(id)
      setHeroError('')
      await deleteHeroImage(id)
      setHeroImages(prev => prev.filter(img => img.id !== id))
    } catch (err) {
      console.error(err)
      setHeroError(err.message || 'No se pudo eliminar la imagen')
    } finally {
      setDeletingHeroId(null)
    }
  }

  // --- Notas de versión (globales, no por liga — solo SuperAdmin) ---
  const [releaseNotes, setReleaseNotes] = useState('')
  const [savingReleaseNotes, setSavingReleaseNotes] = useState(false)
  const [releaseNotesError, setReleaseNotesError] = useState('')
  const [releaseNotesSaved, setReleaseNotesSaved] = useState(false)

  useEffect(() => {
    if (!isSuperAdmin) return

    async function loadPlatformSettings() {
      try {
        const settings = await getPlatformSettings()
        setReleaseNotes(settings?.release_notes || '')
      } catch (err) {
        console.error(err)
      }
    }

    loadPlatformSettings()
  }, [isSuperAdmin])

  async function handleSaveReleaseNotes(e) {
    e.preventDefault()

    try {
      setSavingReleaseNotes(true)
      setReleaseNotesError('')
      setReleaseNotesSaved(false)

      await updatePlatformReleaseNotes(releaseNotes)

      setReleaseNotesSaved(true)
    } catch (err) {
      console.error(err)
      setReleaseNotesError(err.message || 'No se pudieron guardar las notas de versión')
    } finally {
      setSavingReleaseNotes(false)
    }
  }

  // --- Nombres de estadísticas ---
  const [statLabels, setStatLabels] = useState(getStatLabels(league))
  const [savingStatLabels, setSavingStatLabels] = useState(false)
  const [statLabelsError, setStatLabelsError] = useState('')
  const [statLabelsSaved, setStatLabelsSaved] = useState(false)

  function handleStatLabelChange(key, value) {
    setStatLabels(prev => ({ ...prev, [key]: value }))
    setStatLabelsSaved(false)
  }

  async function handleSaveStatLabels(e) {
    e.preventDefault()

    try {
      setSavingStatLabels(true)
      setStatLabelsError('')
      setStatLabelsSaved(false)

      await updateLeagueStatLabels(league.id, statLabels)

      setStatLabelsSaved(true)
      // Recarga para que toda la app (Header, Inicio, etc.) tome los nombres nuevos.
      window.location.reload()
    } catch (err) {
      console.error(err)
      setStatLabelsError(err.message || 'No se pudieron guardar los nombres de las estadísticas')
    } finally {
      setSavingStatLabels(false)
    }
  }

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
          <p>Ajusta los nombres de estadísticas y el calendario de partidos por temporada</p>
        </div>

        <div className="config-cards-grid">
        {isSuperAdmin && (
          <section className="config-card">
            <h3>Membresía de la liga</h3>
            <p className="config-card-subtitle">
              Solo visible para SuperAdmin — fecha hasta la que esta liga tiene vigente su membresía
            </p>

            <form onSubmit={handleSaveMembership}>
              <div className="config-fields-row">
                <div className="config-field">
                  <label>Vigente hasta</label>
                  <input
                    type="date"
                    value={membershipDate || ''}
                    onChange={e => {
                      setMembershipDate(e.target.value)
                      setMembershipSaved(false)
                    }}
                  />
                </div>
              </div>

              {membershipError && <p className="modal-error">{membershipError}</p>}
              {membershipSaved && <p className="config-success">✓ Guardado</p>}

              <div className="config-card-actions">
                <button type="submit" disabled={savingMembership}>
                  {savingMembership ? 'Guardando...' : 'Guardar fecha'}
                </button>
              </div>
            </form>
          </section>
        )}

        {isSuperAdmin && (
          <section className="config-card">
            <h3>Notas de versión</h3>
            <p className="config-card-subtitle">
              Solo visible para SuperAdmin — este texto es global (no por liga): lo ve cualquier admin de cualquier liga en su Panel de Administración
            </p>

            <form onSubmit={handleSaveReleaseNotes}>
              <div className="config-field">
                <label>Texto para los admins</label>
                <textarea
                  rows={4}
                  value={releaseNotes}
                  placeholder="Ej. Novedades de esta versión, avisos generales..."
                  onChange={e => {
                    setReleaseNotes(e.target.value)
                    setReleaseNotesSaved(false)
                  }}
                />
              </div>

              {releaseNotesError && <p className="modal-error">{releaseNotesError}</p>}
              {releaseNotesSaved && <p className="config-success">✓ Guardado</p>}

              <div className="config-card-actions">
                <button type="submit" disabled={savingReleaseNotes}>
                  {savingReleaseNotes ? 'Guardando...' : 'Guardar notas'}
                </button>
              </div>
            </form>
          </section>
        )}

        {isFullAdmin && (
          <section className="config-card">
            <h3>Carrusel de fotos en Inicio</h3>
            <p className="config-card-subtitle">
              Sube una o varias fotos (ej. próximas inscripciones, anuncios) para mostrar un carrusel destacado en la página de Inicio. Si no hay fotos, esa sección no se muestra.
            </p>

            <div className="config-field">
              <label>Agregar fotos</label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                disabled={uploadingHero}
                onChange={handleHeroFilesSelected}
              />
            </div>

            {heroError && <p className="modal-error">{heroError}</p>}
            {uploadingHero && <p className="config-card-subtitle">Subiendo...</p>}

            {heroImages.length > 0 && (
              <div className="hero-image-thumb-grid">
                {heroImages.map(img => (
                  <div className="hero-image-thumb" key={img.id}>
                    <img src={img.image_url} alt="" />
                    <button
                      type="button"
                      className="hero-image-thumb-delete"
                      disabled={deletingHeroId === img.id}
                      onClick={() => handleDeleteHeroImage(img.id)}
                    >
                      {deletingHeroId === img.id ? '...' : '✕'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="config-card">
          <h3>Nombres de estadísticas</h3>
          <p className="config-card-subtitle">
            Personaliza cómo se llama cada estadística en toda la app (Inicio, Estadísticas, perfiles y al capturar resultados)
          </p>

          <form onSubmit={handleSaveStatLabels}>
            <div className="config-fields-row">
              {STAT_KEYS.map(key => (
                <div className="config-field" key={key}>
                  <label>Nombre para "{DEFAULT_STAT_LABELS[key]}"</label>
                  <input
                    type="text"
                    value={statLabels[key]}
                    placeholder={DEFAULT_STAT_LABELS[key]}
                    onChange={e => handleStatLabelChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {statLabelsError && <p className="modal-error">{statLabelsError}</p>}
            {statLabelsSaved && <p className="config-success">✓ Guardado</p>}

            <div className="config-card-actions">
              <button type="submit" disabled={savingStatLabels}>
                {savingStatLabels ? 'Guardando...' : 'Guardar nombres'}
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
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ConfigManager
