import './ToastStack.css'

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onDismiss(t.id)}>
          <span className="toast-icon">{t.type === 'success' ? '✓' : '!'}</span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
