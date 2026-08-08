import { createContext, useCallback, useContext, useRef, useState } from 'react'
import ConfirmDialog from '../components/common/ConfirmDialog'

const ConfirmContext = createContext(null)

// Reemplaza window.confirm con un modal del estilo de la app. Uso:
//   const confirm = useConfirm()
//   const ok = await confirm({ message: '¿Eliminar "X"?', danger: true })
//   if (!ok) return
export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null)
  const resolveRef = useRef(null)

  const confirm = useCallback((opts) => {
    return new Promise(resolve => {
      resolveRef.current = resolve
      setOptions(typeof opts === 'string' ? { message: opts } : opts)
    })
  }, [])

  function handleResult(result) {
    setOptions(null)
    resolveRef.current?.(result)
    resolveRef.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmDialog
          title={options.title}
          message={options.message}
          confirmLabel={options.confirmLabel}
          cancelLabel={options.cancelLabel}
          danger={options.danger}
          onConfirm={() => handleResult(true)}
          onCancel={() => handleResult(false)}
        />
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>')
  return ctx
}
