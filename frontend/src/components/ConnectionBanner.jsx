import { useEffect, useState } from 'react'
import { Wifi, WifiOff, Server, AlertTriangle, X } from 'lucide-react'
import { connectSocket, getSocket } from '../services/socket'

const useBackendStatus = () => {
  const [apiOnline, setApiOnline] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)

  useEffect(() => {
    const checkApi = async () => {
      try {
        const base = (import.meta.env.VITE_API_URL || '/api').replace('/api', '')
        const res = await fetch(`${base}/`, { signal: AbortSignal.timeout(4000) })
        setApiOnline(res.ok)
      } catch {
        setApiOnline(false)
      }
    }
    checkApi()
    const t = setInterval(checkApi, 20000)

    const socket = connectSocket()
    const onC = () => setSocketConnected(true)
    const onD = () => setSocketConnected(false)
    socket.on('connect', onC)
    socket.on('disconnect', onD)
    if (socket.connected) setSocketConnected(true)

    return () => {
      clearInterval(t)
      socket.off('connect', onC)
      socket.off('disconnect', onD)
    }
  }, [])

  return { apiOnline, socketConnected }
}

export const ConnectionBanner = () => {
  const { apiOnline, socketConnected } = useBackendStatus()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || apiOnline === null) return null
  if (apiOnline && socketConnected) return null

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 text-xs font-medium
      ${apiOnline === false
        ? 'bg-red-900/60 border-b border-red-700/40 text-red-200'
        : 'bg-amber-900/40 border-b border-amber-700/30 text-amber-200'
      }`}
    >
      {apiOnline === false ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <span>
            <strong>Backend offline</strong> — Start the ResQMesh backend on port 3001.
            The UI will show demo data in the meantime.
          </span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Real-time disconnected</strong> — Live updates paused. Retrying…
          </span>
        </>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto text-current opacity-60 hover:opacity-100 flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export const ConnectionDot = ({ className = '' }) => {
  const { apiOnline, socketConnected } = useBackendStatus()
  const online = apiOnline && socketConnected
  const partial = apiOnline && !socketConnected

  return (
    <div
      className={`flex items-center gap-1.5 text-xs ${className}`}
      title={online ? 'Backend connected' : partial ? 'API connected, socket offline' : 'Backend offline'}
    >
      <span className={`relative flex h-2 w-2`}>
        {online && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          online ? 'bg-emerald-500' : partial ? 'bg-amber-500' : 'bg-red-500'
        }`} />
      </span>
      <span className={online ? 'text-emerald-400' : partial ? 'text-amber-400' : 'text-red-400'}>
        {online ? 'Live' : partial ? 'Partial' : 'Offline'}
      </span>
    </div>
  )
}

export default ConnectionBanner
