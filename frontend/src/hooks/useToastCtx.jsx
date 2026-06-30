import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { ToastContainer } from '../components/Toast'

const ToastCtx = createContext(null)

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    setToasts((p) => p.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    ({ title, message, type = 'info', duration = 4000 }) => {
      const id = ++_id
      setToasts((p) => [...p.slice(-4), { id, title, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  const api = {
    show,
    success: (title, msg) => show({ title, message: msg, type: 'success' }),
    error: (title, msg) => show({ title, message: msg, type: 'error', duration: 6000 }),
    warning: (title, msg) => show({ title, message: msg, type: 'warning' }),
    info: (title, msg) => show({ title, message: msg, type: 'info' }),
    dismiss,
  }

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  )
}

export function useToastCtx() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToastCtx must be inside ToastProvider')
  return ctx
}
