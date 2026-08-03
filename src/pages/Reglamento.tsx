import { useEffect, useState } from 'react'

import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'
import DocumentLinkCard from '../components/common/DocumentLinkCard'
import DocumentUploadModal from '../components/Admin/DocumentUploadModal'

import { useLeague } from '../context/LeagueContext'
import { useLeagueMembership } from '../hooks/useLeagueMembership'

import { getDocumentsByLeagueId } from '../services/document.service.js'

import './Reglamento.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function Reglamento() {
  const { league } = useLeague()
  const { isFullAdmin } = useLeagueMembership()

  const [documents, setDocuments] = useState([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    if (!league) return

    async function loadDocuments() {
      try {
        setLoadingDocuments(true)
        const data = await getDocumentsByLeagueId(league.id)
        setDocuments(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingDocuments(false)
      }
    }

    loadDocuments()
  }, [league?.id])

  function handleDocumentSaved(saved) {
    setDocuments(prev => [saved, ...prev])
  }

  const isDataLoading = !league || loadingDocuments

  return (
    <div className="app-layout">
      <Loader show={isDataLoading} label="Cargando..." />
      <PageWrapper loading={isDataLoading}/>
      <Header league={league}/>

      <main className="reglamento-container">
        <div className="section-header">
          <div className="reglamento-intro">
            <h2>Reglamento</h2>
            <p>Consulta los documentos oficiales de {league?.name}</p>
          </div>

          {isFullAdmin && (
            <button className="primary-btn" onClick={() => setShowUploadModal(true)}>
              + Subir PDF
            </button>
          )}
        </div>

        {!loadingDocuments && documents.length === 0 ? (
          <p className="empty-state">Aún no hay documentos de reglamento cargados</p>
        ) : (
          <div className="document-link-list">
            {documents.map(doc => (
              <DocumentLinkCard
                key={doc.id}
                title={doc.name}
                dateLabel={`Subido el ${formatDate(doc.created_at)}`}
                previewUrl={doc.file_url}
                actions={(
                  <>
                    <a href={doc.file_url} target="_blank" rel="noreferrer">
                      Abrir
                    </a>
                    <a href={doc.file_url} download={`${doc.name}.pdf`}>
                      Descargar
                    </a>
                  </>
                )}
              />
            ))}
          </div>
        )}
      </main>

      {showUploadModal && (
        <DocumentUploadModal
          leagueId={league?.id}
          onClose={() => setShowUploadModal(false)}
          onSaved={handleDocumentSaved}
        />
      )}

      <Footer />
    </div>
  )
}

export default Reglamento
