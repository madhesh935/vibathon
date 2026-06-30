import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export const connectSocket = () => {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect()
}

// ─── Backend Socket.IO events ─────────────────────────────────────────────────
// Server → Client events:
//   new-report         { ...reportObject }
//   priority-updated   { report_id, priority, advice, report }
//   rescue-response    { report_id, response, report }
//   status-updated     { report_id, status, report }

/**
 * Subscribe to all new reports (dashboard feed).
 */
export const onNewReport = (callback) => {
  const s = getSocket()
  s.on('new-report', callback)
  return () => s.off('new-report', callback)
}

/**
 * Subscribe to AI triage completions.
 */
export const onPriorityUpdated = (callback) => {
  const s = getSocket()
  s.on('priority-updated', callback)
  return () => s.off('priority-updated', callback)
}

/**
 * Subscribe to operator rescue responses.
 * Optionally filter by reportId.
 */
export const onRescueResponse = (callback, reportId = null) => {
  const s = getSocket()
  const handler = (data) => {
    if (!reportId || data.report_id === reportId) callback(data)
  }
  s.on('rescue-response', handler)
  return () => s.off('rescue-response', handler)
}

/**
 * Subscribe to status updates (victim tracking).
 * Optionally filter by reportId.
 */
export const onStatusUpdated = (callback, reportId = null) => {
  const s = getSocket()
  const handler = (data) => {
    if (!reportId || data.report_id === reportId) callback(data)
  }
  s.on('status-updated', handler)
  return () => s.off('status-updated', handler)
}

export default { getSocket, connectSocket, disconnectSocket }
