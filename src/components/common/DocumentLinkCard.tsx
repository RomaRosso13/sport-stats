import './DocumentLinkCard.css'

// Reglamento y Fotos comparten el mismo patrón visual: una tarjeta con
// nombre + fecha + acciones, y un iframe de previsualización (PDF o Google
// Drive) debajo. Este componente centraliza ese layout para no mantenerlo
// duplicado en los CSS de ambas páginas.
function DocumentLinkCard({ title, dateLabel, actions, previewUrl, emptyPreviewMessage = null, compactPreview = false }) {
  return (
    <section className="document-link-card">
      <div className="document-link-card-header">
        <div className="document-link-card-info">
          <h3>{title}</h3>
          {dateLabel && <span className="document-link-card-date">{dateLabel}</span>}
        </div>

        <div className="document-link-card-actions">
          {actions}
        </div>
      </div>

      {previewUrl ? (
        <iframe
          src={previewUrl}
          title={title}
          className={`document-link-preview ${compactPreview ? 'compact' : ''}`}
        />
      ) : (
        emptyPreviewMessage && <p className="document-link-no-preview">{emptyPreviewMessage}</p>
      )}
    </section>
  )
}

export default DocumentLinkCard
