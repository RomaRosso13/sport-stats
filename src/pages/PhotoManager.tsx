import { useEffect, useState } from 'react'

import { useLeague } from '../context/LeagueContext'
import { useSeason } from '../context/SeasonContext'
import { useCategory } from '../context/CategoryContext'
import { useLeagueMembership } from '../hooks/useLeagueMembership'

import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'
import JornadaLinkModal from '../components/Admin/JornadaLinkModal'

import { getMatchDaysByCategoryIds } from '../services/matchday.service'
import { getJornadaLinksBySeasonId, deleteJornadaLink } from '../services/jornada_link.service.js'
import { getGoogleDriveEmbedUrl } from '../utils/googleDriveEmbed'

import './PhotoManager.css'

function PhotoManager() {
  const { league } = useLeague()
  const { season } = useSeason()
  const { categories } = useCategory()
  const { isFullAdmin, isPhotographer } = useLeagueMembership()
  const canManage = isFullAdmin || isPhotographer

  const [jornadas, setJornadas] = useState([])
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeJornada, setActiveJornada] = useState(null)

  useEffect(() => {
    if (!season || !categories || categories.length === 0) {
      setJornadas([])
      setLinks([])
      setLoading(false)
      return
    }

    async function loadData() {
      try {
        setLoading(true)

        const categoryIds = categories.map(cat => cat.id)
        const [matchdaysData, linksData] = await Promise.all([
          getMatchDaysByCategoryIds(categoryIds),
          getJornadaLinksBySeasonId(season.id)
        ])

        // Una jornada es compartida por todas las categorías: se agrupa por
        // fecha, igual que en el calendario público.
        const byDate = new Map()
        ;(matchdaysData || []).forEach(md => {
          if (!byDate.has(md.date)) {
            byDate.set(md.date, { date: md.date, names: new Set() })
          }
          byDate.get(md.date).names.add(md.name)
        })

        const days = Array.from(byDate.values())
          .map(day => ({ ...day, name: [...day.names].join(' · ') }))
          .sort((a, b) => a.date.localeCompare(b.date))

        setJornadas(days)
        setLinks(linksData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [season?.id, categories])

  function handleLinkSaved(saved) {
    setLinks(prev => {
      const exists = prev.some(l => l.id === saved.id)
      return exists ? prev.map(l => l.id === saved.id ? saved : l) : [...prev, saved]
    })
    setActiveJornada(null)
  }

  async function handleDeleteLink(link) {
    if (!window.confirm('¿Quitar el enlace de esta jornada?')) return

    try {
      await deleteJornadaLink(link.id)
      setLinks(prev => prev.filter(l => l.id !== link.id))
    } catch (err) {
      console.error(err)
      alert('No se pudo quitar el enlace')
    }
  }

  function formatJornadaDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(`${dateStr}T00:00:00`)
    const formatted = date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  const isDataLoading = !league || loading

  return (
    <div className="app-layout">
      <Loader show={isDataLoading} label="Cargando..." />
      <PageWrapper loading={isDataLoading}/>
      <Header league={league} />

      <main className="photo-manager-container">
        <div className="photo-manager-intro">
          <h2>Fotos</h2>
          <p>Encuentra el enlace con las fotos de cada jornada de {league?.name}</p>
        </div>

        {!loading && jornadas.length === 0 ? (
          <p className="empty-state">Aún no hay jornadas programadas</p>
        ) : (
          <div className="jornada-link-list">
            {jornadas.map(jornada => {
              const link = links.find(l => l.date === jornada.date)
              const embedUrl = getGoogleDriveEmbedUrl(link?.url)

              return (
                <section key={jornada.date} className="jornada-link-card">
                  <div className="jornada-link-card-header">
                    <div className="jornada-link-card-info">
                      <h3>{jornada.name}</h3>
                      <span className="jornada-link-card-date">{formatJornadaDate(jornada.date)}</span>
                    </div>

                    <div className="jornada-link-card-actions">
                      {link && (
                        <a href={link.url} target="_blank" rel="noreferrer">
                          Abrir enlace
                        </a>
                      )}
                      {canManage && (
                        <button type="button" onClick={() => setActiveJornada(jornada)}>
                          {link ? 'Editar enlace' : 'Agregar enlace'}
                        </button>
                      )}
                      {canManage && link && (
                        <button type="button" className="remove-link-btn" onClick={() => handleDeleteLink(link)}>
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>

                  {embedUrl && (
                    <iframe src={embedUrl} className="jornada-link-preview" title={`Fotos de ${jornada.name}`} />
                  )}

                  {link && !embedUrl && (
                    <p className="jornada-link-no-preview">
                      No se puede previsualizar este enlace aquí — usa "Abrir enlace".
                    </p>
                  )}

                  {!link && !canManage && (
                    <p className="jornada-link-no-preview">
                      Aún no hay fotos de esta jornada.
                    </p>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </main>

      {activeJornada && (
        <JornadaLinkModal
          seasonId={season?.id}
          jornada={activeJornada}
          existingUrl={links.find(l => l.date === activeJornada.date)?.url}
          onClose={() => setActiveJornada(null)}
          onSaved={handleLinkSaved}
        />
      )}

      <Footer />
    </div>
  )
}

export default PhotoManager
