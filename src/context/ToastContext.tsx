import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import ToastStack from '../components/common/ToastStack'

const ToastContext = createContext(null)

let nextToastId = 1

// Reemplaza alert(...) con una notificación del estilo de la app. Uso:
//   const toast = useToast()
//   toast.error('No se pudo eliminar el equipo')
//   toast.success('Equipo actualizado')
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((message, type) => {
    const id = nextToastId++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => dismiss(id), 4500)
  }, [dismiss])

  const api = useMemo(() => ({
    error: message => push(message, 'error'),
    success: message => push(message, 'success')
  }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
