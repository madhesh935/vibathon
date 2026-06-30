import { useState, useEffect, useCallback, useRef } from 'react'
import { getReports, getStatistics, getReport } from '../services/api'
import { connectSocket, onNewReport, onPriorityUpdated, onStatusUpdated } from '../services/socket'

/**
 * Fetch and auto-refresh incident list.
 * Also subscribes to Socket.IO new-report & priority-updated events.
 */
export const useIncidents = (pollMs = 0) => {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const pollRef = useRef(null)

  const fetch = useCallback(async () => {
    try {
      const res = await getReports()
      const data = Array.isArray(res.data) ? res.data : res.data?.reports ?? []
      setIncidents(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()

    if (pollMs > 0) {
      pollRef.current = setInterval(fetch, pollMs)
    }

    const socket = connectSocket()

    const unsubNew = onNewReport((report) => {
      setIncidents((prev) => {
        const exists = prev.find((r) => r._id === report._id)
        return exists ? prev : [report, ...prev]
      })
      setLastUpdated(new Date())
    })

    const unsubPriority = onPriorityUpdated(({ report_id, priority, advice, report }) => {
      setIncidents((prev) =>
        prev.map((r) => (r._id === report_id ? { ...r, priority, advice, ...report } : r))
      )
    })

    const unsubStatus = onStatusUpdated(({ report_id, status, report }) => {
      setIncidents((prev) =>
        prev.map((r) => (r._id === report_id ? { ...r, status, ...report } : r))
      )
    })

    return () => {
      clearInterval(pollRef.current)
      unsubNew()
      unsubPriority()
      unsubStatus()
    }
  }, [fetch, pollMs])

  return { incidents, loading, error, refetch: fetch, lastUpdated }
}

/**
 * Fetch dashboard statistics. Auto-polls and listens to Socket.IO new-report.
 */
export const useStats = (pollMs = 10000) => {
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, resolved: 0, critical: 0, high: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      const res = await getStatistics()
      setStats(res.data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const t = setInterval(fetch, pollMs)
    const unsub = onNewReport(() => fetch())
    return () => {
      clearInterval(t)
      unsub()
    }
  }, [fetch, pollMs])

  return { stats, loading, error, refetch: fetch }
}

/**
 * Fetch a single report by ID and track its status in real-time.
 */
export const useReport = (id) => {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      try {
        const res = await getReport(id)
        setReport(res.data)
        setError(null)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()

    const unsubStatus = onStatusUpdated(({ status, report: r }) => {
      setReport((prev) => prev ? { ...prev, status, ...r } : prev)
    }, id)

    const unsubPriority = onPriorityUpdated(({ priority, advice, report: r }) => {
      setReport((prev) => prev ? { ...prev, priority, advice, ...r } : prev)
    })

    return () => {
      unsubStatus()
      unsubPriority()
    }
  }, [id])

  return { report, loading, error }
}

/**
 * Backend + Socket.IO connection health hook.
 */
export const useConnectionStatus = () => {
  const [backendOnline, setBackendOnline] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(
          (import.meta.env.VITE_API_URL || '/api').replace('/api', '') + '/',
          { signal: AbortSignal.timeout(4000) }
        )
        setBackendOnline(res.ok)
      } catch {
        setBackendOnline(false)
      } finally {
        setChecking(false)
      }
    }
    check()
    const t = setInterval(check, 15000)

    const socket = connectSocket()
    const onConnect = () => setSocketConnected(true)
    const onDisconnect = () => setSocketConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    if (socket.connected) setSocketConnected(true)

    return () => {
      clearInterval(t)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return { backendOnline, socketConnected, checking }
}
