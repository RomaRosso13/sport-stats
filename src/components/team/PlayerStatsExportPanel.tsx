import { useEffect, useMemo, useState } from 'react'

import PlayerStatsExportCard from './PlayerStatsExportCard'
import { isValidHex } from '../../utils/colorMath'
import { renderPlayerStatsCanvas } from '../../utils/renderPlayerStatsCanvas'
import { EXPORT_SCALE, PLAYER_TOP_N_OPTIONS, getRecommendedFormat, getVisibleRows } from '../../utils/exportCardConfig'
import { dataUrlToBlob, withTimeout } from '../../utils/canvasExport'

import '../common/ExportPanel.css'

const CATEGORY_LABELS = { Mixto: 'Mixto', Femenil: 'Femenil', Varonil: 'Varonil' }
const SWATCHES = ['#2563eb', '#16a34a', '#e6007e', '#9333ea', '#0f172a']

function getDefaultSubtitle(statLabel, category, season) {
  const categoryLabel = CATEGORY_LABELS[category?.type] || category?.type || ''
  return [categoryLabel, season?.name].filter(Boolean).join(' · ')
}

function getDefaults(league, category, season, statLabel, rowCount) {
  const leagueColor = isValidHex(league?.primary_color) ? league.primary_color : '#2563eb'
  return {
    backgroundMode: 'color',
    baseColor: leagueColor,
    backgroundImageUrl: null,
    format: getRecommendedFormat(rowCount),
    topN: rowCount >= 10 ? 10 : 5,
    subtitle: getDefaultSubtitle(statLabel, category, season),
    showMedals: true
  }
}

function PlayerStatsExportPanel({ onClose, league, category, season, leaderboards, statSections, completePlayers, statKey: initialStatKey }) {
  const [mode, setMode] = useState('stat')
  const [selectedStatKey, setSelectedStatKey] = useState(initialStatKey)
  const selectedSection = statSections.find(section => section.key === selectedStatKey) || statSections[0]
  const statKey = selectedSection.key
  const statLabel = selectedSection.label
  const players = leaderboards[statKey] || []
  const rows = mode === 'complete' ? completePlayers : players
  const rowCount = rows.length
  const title = mode === 'complete' ? 'Jugadores más completos' : statLabel

  const defaults = useMemo(
    () => getDefaults(league, category, season, statLabel, rowCount),
    [league, category, season, statLabel, rowCount]
  )

  const [options, setOptions] = useState(defaults)
  const [imageFile, setImageFile] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [shareSupported, setShareSupported] = useState(false)

  useEffect(() => {
    setShareSupported(typeof navigator.share === 'function' && typeof navigator.canShare === 'function')
  }, [])

  useEffect(() => {
    return () => {
      if (options.backgroundImageUrl) URL.revokeObjectURL(options.backgroundImageUrl)
    }
  }, [options.backgroundImageUrl])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function update(patch) {
    setOptions(prev => ({ ...prev, ...patch }))
  }

  function handleUseRecommended() {
    if (options.backgroundImageUrl) URL.revokeObjectURL(options.backgroundImageUrl)
    setImageFile(null)
    setOptions(getDefaults(league, category, season, statLabel, rowCount))
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (options.backgroundImageUrl) URL.revokeObjectURL(options.backgroundImageUrl)
    const url = URL.createObjectURL(file)
    setImageFile(file)
    update({ backgroundMode: 'image', backgroundImageUrl: url })
  }

  const visibleRows = getVisibleRows(rows, options.topN)

  async function generateBlob() {
    // Se dibuja a mano con Canvas 2D (ver renderPlayerStatsCanvas) en vez de
    // usar html2canvas: html2canvas necesita clonar la página completa en un
    // <iframe> oculto antes de poder rasterizar nada, y ese paso se cuelga
    // en Safari sin avanzar ni fallar.
    const canvas = await withTimeout(
      renderPlayerStatsCanvas({
        league,
        rows: visibleRows,
        mode,
        statKey,
        statLabel,
        format: options.format,
        backgroundMode: options.backgroundMode,
        baseColor: options.baseColor,
        backgroundImageUrl: options.backgroundImageUrl,
        subtitle: options.subtitle,
        showMedals: options.showMedals,
        scale: EXPORT_SCALE
      }),
      8000,
      'La imagen tardó demasiado en generarse. Intenta de nuevo o usa otra foto de fondo.'
    )
    const dataUrl = canvas.toDataURL('image/png')
    return dataUrlToBlob(dataUrl)
  }

  async function handleDownload() {
    try {
      setGenerating(true)
      setError('')
      const blob = await generateBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `estadisticas-${mode === 'complete' ? 'completos' : statKey}-${league?.slug || 'liga'}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo generar la imagen')
    } finally {
      setGenerating(false)
    }
  }

  async function handleShare() {
    try {
      setGenerating(true)
      setError('')
      const blob = await generateBlob()
      const file = new File([blob], 'estadisticas.png', { type: 'image/png' })

      if (shareSupported && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: `${title} — ${league?.name || ''}`
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `estadisticas-${mode === 'complete' ? 'completos' : statKey}-${league?.slug || 'liga'}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err)
        setError(err.message || 'No se pudo generar la imagen')
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="export-modal-backdrop" onClick={onClose}>
      <div className="export-panel" onClick={e => e.stopPropagation()}>
        <div className="export-panel-header">
          <h3>Exportar {title}</h3>
          <button type="button" className="export-panel-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="export-panel-body">
          <div className="export-panel-options">
            <button type="button" className="quick-default" onClick={handleUseRecommended}>
              ⚡ Usar valores recomendados
            </button>

            <div className="opt-group">
              <h4>Tipo</h4>
              <div className="seg">
                <button type="button" className={mode === 'stat' ? 'active' : ''} onClick={() => setMode('stat')}>Por estadística</button>
                <button
                  type="button"
                  className={mode === 'complete' ? 'active' : ''}
                  onClick={() => setMode('complete')}
                  disabled={!completePlayers || completePlayers.length === 0}
                >
                  Jugadores completos
                </button>
              </div>
            </div>

            {mode === 'stat' && (
              <div className="opt-group">
                <h4>Estadística</h4>
                <div className="seg seg-wrap">
                  {statSections.map(section => (
                    <button
                      key={section.key}
                      type="button"
                      className={statKey === section.key ? 'active' : ''}
                      onClick={() => setSelectedStatKey(section.key)}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="opt-group">
              <h4>Fondo</h4>
              <div className="seg">
                <button type="button" className={options.backgroundMode === 'color' ? 'active' : ''} onClick={() => update({ backgroundMode: 'color' })}>Color</button>
                <button type="button" className={options.backgroundMode === 'image' ? 'active' : ''} onClick={() => update({ backgroundMode: 'image' })} disabled={!options.backgroundImageUrl}>Imagen</button>
              </div>
            </div>

            <div className="opt-group">
              <h4>Color base</h4>
              <div className="swatches">
                {SWATCHES.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`swatch ${options.baseColor === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => update({ baseColor: color, backgroundMode: 'color' })}
                    aria-label={color}
                  />
                ))}
                <input
                  type="color"
                  className="swatch-custom"
                  value={options.baseColor}
                  onChange={e => update({ baseColor: e.target.value, backgroundMode: 'color' })}
                  aria-label="Color personalizado"
                />
              </div>
            </div>

            <div className="opt-group">
              <h4>Foto de fondo</h4>
              <label className="upload-slot">
                {imageFile ? imageFile.name : '📷 Subir foto (opcional)'}
                <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} hidden />
              </label>
            </div>

            <div className="opt-group">
              <h4>Formato</h4>
              <div className="seg">
                <button type="button" className={options.format === 'square' ? 'active' : ''} onClick={() => update({ format: 'square' })}>Cuadrado</button>
                <button type="button" className={options.format === 'story' ? 'active' : ''} onClick={() => update({ format: 'story' })}>Historia</button>
              </div>
            </div>

            <div className="opt-group">
              <h4>Cuántos jugadores</h4>
              <div className="seg">
                {PLAYER_TOP_N_OPTIONS.map(opt => (
                  <button key={opt.label} type="button" className={options.topN === opt.value ? 'active' : ''} onClick={() => update({ topN: opt.value })}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="opt-group">
              <h4>Subtítulo</h4>
              <input
                type="text"
                className="text-slot"
                value={options.subtitle}
                onChange={e => update({ subtitle: e.target.value })}
                placeholder="Categoría · Temporada"
              />
            </div>

            <div className="opt-group">
              <label className="toggle-row">
                <div>
                  <div className="lbl">Podio con medallas</div>
                  <div className="hint">Oro/plata/bronce para el top 3</div>
                </div>
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={options.showMedals}
                  onChange={e => update({ showMedals: e.target.checked })}
                />
              </label>
            </div>
          </div>

          <div className="export-panel-preview">
            <PlayerStatsExportCard
              league={league}
              rows={visibleRows}
              mode={mode}
              statKey={statKey}
              statLabel={statLabel}
              format={options.format}
              backgroundMode={options.backgroundMode}
              baseColor={options.baseColor}
              backgroundImageUrl={options.backgroundImageUrl}
              subtitle={options.subtitle}
              showMedals={options.showMedals}
            />
          </div>
        </div>

        {error && <p className="export-panel-error">{error}</p>}

        <div className="export-panel-actions">
          <button type="button" className="btn-share" onClick={handleShare} disabled={generating}>
            {generating ? 'Generando...' : '↗ Compartir'}
          </button>
          <button type="button" className="btn-download" onClick={handleDownload} disabled={generating}>
            {generating ? 'Generando...' : '⬇ Descargar imagen'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerStatsExportPanel
