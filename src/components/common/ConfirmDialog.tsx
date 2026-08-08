import { useEffect } from 'react'
import './ConfirmDialog.css'

function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger, onConfirm, onCancel }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div className="confirm-dialog-backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <h3>{title || (danger ? '¿Eliminar?' : '¿Confirmar?')}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-dialog-confirm ${danger ? 'danger' : ''}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
