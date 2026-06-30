import { useState, useCallback, useRef } from 'react'

let toastId = 0

export const useToast = () => {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, title, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  const success = useCallback(
    (title, message) => toast({ title, message, type: 'success' }),
    [toast]
  )
  const error = useCallback(
    (title, message) => toast({ title, message, type: 'error', duration: 6000 }),
    [toast]
  )
  const warning = useCallback(
    (title, message) => toast({ title, message, type: 'warning' }),
    [toast]
  )
  const info = useCallback(
    (title, message) => toast({ title, message, type: 'info' }),
    [toast]
  )

  return { toasts, toast, success, error, warning, info, dismiss }
}
