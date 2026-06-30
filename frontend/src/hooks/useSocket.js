import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { connectSocket, getSocket } from '../services/socket'

export const useSocket = (autoConnect = true) => {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!autoConnect) return

    const socket = connectSocket()
    socketRef.current = socket

    const onConnect = () => { setConnected(true); setError(null) }
    const onDisconnect = () => setConnected(false)
    const onError = (err) => setError(err?.message ?? 'Connection error')

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onError)

    if (socket.connected) setConnected(true)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onError)
    }
  }, [autoConnect])

  const emit = (event, data) => socketRef.current?.emit(event, data)

  const on = (event, handler) => {
    const s = socketRef.current || getSocket()
    s.on(event, handler)
    return () => s.off(event, handler)
  }

  return { connected, error, socket: socketRef.current, emit, on }
}
