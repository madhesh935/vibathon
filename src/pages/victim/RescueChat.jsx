import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Siren, Radio, Clock } from 'lucide-react'
import { getReport } from '../../services/api'
import { connectSocket, onRescueResponse, onPriorityUpdated } from '../../services/socket'

const priorityColor = {
  CRITICAL: 'text-red-400 bg-red-950/30 border border-red-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold',
  HIGH: 'text-orange-400 bg-orange-950/30 border border-orange-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold',
  MEDIUM: 'text-amber-400 bg-amber-950/30 border border-amber-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold',
  LOW: 'text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold',
  PENDING: 'text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded-full text-[10px] font-bold',
  ASSIGNED: 'text-blue-400 bg-blue-950/30 border border-blue-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold',
  RESOLVED: 'text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold',
}

export const RescueChat = () => {
  const navigate    = useNavigate()
  const [msgs, setMsgs]                 = useState([])
  const [input, setInput]               = useState('')
  const [report, setReport]             = useState(null)
  const [channelStatus, setChannelStatus] = useState('connecting')
  const [fetchError, setFetchError]     = useState(null)
  const bottomRef                       = useRef(null)
  const incidentId                      = localStorage.getItem('resqmesh_active_incident')

  useEffect(() => {
    if (!incidentId) { setChannelStatus('no-incident'); return }
    getReport(incidentId)
      .then(res => {
        setReport(res.data)
        setChannelStatus('active')
        const seed = []
        if (res.data?.message) {
          seed.push({ id: 'seed-msg', text: res.data.message, from: 'victim', time: res.data.created_at ? new Date(res.data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' })
        }
        if (res.data?.response) {
          seed.push({ id: 'seed-resp', text: res.data.response, from: 'operator', label: 'Rescue Operator', time: '' })
        }
        if (res.data?.advice) {
          seed.push({ id: 'seed-ai', text: res.data.advice, from: 'ai', label: 'ResQ AI', time: '' })
        }
        if (seed.length) setMsgs(seed)
      })
      .catch(e => {
        if (e.status === 404) { localStorage.removeItem('resqmesh_active_incident'); setChannelStatus('no-incident'); setFetchError('Incident expired.') }
        else { setChannelStatus('error'); setFetchError(e.message) }
      })
  }, [incidentId])

  useEffect(() => {
    if (!incidentId) return
    connectSocket()
    const unsubResp = onRescueResponse(d => {
      const text = d.response || d.report?.response
      if (!text) return
      setMsgs(p => [...p, { id: Date.now(), text, from: 'operator', label: 'Rescue Operator', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    })
    const unsubAI = onPriorityUpdated(d => {
      if (d.advice) setMsgs(p => [...p, { id: Date.now(), text: `AI Triage: ${d.advice}`, from: 'ai', label: 'ResQ AI', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    })
    return () => { unsubResp(); unsubAI() }
  }, [incidentId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const handleSend = () => {
    if (!input.trim()) return
    setMsgs(p => [...p, { id: Date.now(), text: input.trim(), from: 'victim', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setInput('')
  }

  if (!incidentId && !fetchError) {
    return (
      <div className="h-full p-5 lg:p-7 flex flex-col items-center justify-center bg-[#0d1117]">
        <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md p-8 max-w-sm text-center flex flex-col items-center gap-4 rounded-2xl">
          <div className="w-16 h-16 bg-red-950/30 border border-red-900/30 rounded-full flex items-center justify-center">
            <Siren className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">No Active Channel</h2>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Submit an emergency alert first to establish a secure real-time channel with rescue operations.
            </p>
          </div>
          <button onClick={() => navigate('/victim/report')}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20">
            <Siren className="w-4 h-4" /> Report Emergency
          </button>
        </div>
      </div>
    )
  }

  const statusC = priorityColor[report?.status] || 'text-slate-400 bg-slate-700'

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0d1117]">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-white/5 bg-[#0d1117]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white border border-blue-500/25">
            <Radio className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Rescue Control</p>
            <p className={`text-xs flex items-center gap-1 font-semibold ${
              channelStatus === 'active' ? 'text-emerald-400' : channelStatus === 'error' ? 'text-red-400' : 'text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${channelStatus === 'active' ? 'bg-emerald-500 animate-pulse' : channelStatus === 'error' ? 'bg-red-500' : 'bg-slate-400 animate-pulse'}`} />
              {channelStatus === 'active' ? 'Secure mesh channel active' : channelStatus === 'error' ? 'Connection error' : 'Connecting…'}
            </p>
          </div>
          {report?.status && (
            <span className={statusC}>{report.status}</span>
          )}
        </div>
        {report?.advice && (
          <div className="mt-3 bg-purple-950/40 border border-purple-500/25 rounded-xl px-3 py-2">
            <p className="text-purple-300 text-[10px] font-bold uppercase tracking-wide mb-0.5">AI Advice</p>
            <p className="text-slate-300 text-xs leading-relaxed">{report.advice}</p>
          </div>
        )}
        {fetchError && (
          <div className="mt-2 bg-red-950/40 border border-red-500/25 rounded-xl px-3 py-2">
            <p className="text-red-300 text-xs font-semibold">{fetchError}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0 bg-[#0a0d14]">
        {msgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <Radio className="w-10 h-10 text-slate-700 mb-3 animate-pulse" />
            <p className="text-white text-sm font-bold">Channel Established</p>
            <p className="text-slate-400 text-xs mt-1">Stand by. Operator responses will appear here in real time.</p>
          </div>
        ) : msgs.map(m => (
          <div key={m.id} className={`flex ${m.from === 'victim' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%]`}>
              {m.from !== 'victim' && (
                <p className={`text-[10px] font-bold mb-1 uppercase tracking-wide ml-1 ${
                  m.from === 'ai' ? 'text-purple-300' : 'text-blue-300'
                }`}>{m.label || 'Operator'}</p>
              )}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                m.from === 'victim'
                  ? 'bg-red-600 border border-red-700 text-white rounded-br-sm'
                  : m.from === 'ai'
                    ? 'bg-purple-950/30 border border-purple-500/20 text-slate-100 rounded-bl-sm'
                    : 'bg-[#1e293b]/40 border border-blue-500/20 text-slate-100 rounded-bl-sm'
              }`}>
                {m.text}
              </div>
              {m.time && (
                <p className={`text-[9px] text-slate-500 mt-1 ${m.from === 'victim' ? 'text-right' : 'text-left'} flex items-center gap-1 ${m.from === 'victim' ? 'justify-end' : ''}`}>
                  <Clock className="w-2.5 h-2.5" />{m.time}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-white/5 bg-[#0d1117]">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={!incidentId}
            placeholder={incidentId ? 'Type your message…' : 'No active incident'}
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:bg-slate-900 transition-colors disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !incidentId}
            className="w-12 h-12 bg-red-600 hover:bg-red-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0 shadow-lg shadow-red-500/20 disabled:shadow-none border border-white/5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-slate-500 text-[10px] text-center mt-2 font-medium">
          Relayed through Mesh Network · Secured Connection
        </p>
      </div>
    </div>
  )
}

export default RescueChat
