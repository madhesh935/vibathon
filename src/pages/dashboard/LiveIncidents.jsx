import { useState, useMemo, useEffect } from 'react'
import {
  Brain, Search, MapPin, Clock, AlertTriangle,
  MessageSquare, Send, CheckSquare, RefreshCw, X
} from 'lucide-react'
import { useIncidents } from '../../hooks/useIncidents'
import { sendResponse } from '../../services/api'

const PC = {
  CRITICAL: { text: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    dot: 'bg-red-500'    },
  HIGH:     { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500' },
  MEDIUM:   { text: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  dot: 'bg-amber-500'  },
  LOW:      { text: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',dot: 'bg-emerald-500'},
}
const SC = {
  PENDING:  { text: 'text-slate-400',   bg: 'bg-slate-700'      },
  ASSIGNED: { text: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  RESOLVED: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
}

function buildTimeline(r) {
  if (!r) return []
  const t0 = r.created_at ? new Date(r.created_at) : null
  const fmt = (d) => d?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '—'
  return [
    { label: 'SOS Received',          time: fmt(t0),                       done: true                                  },
    { label: 'Stored in Relay Buffer', time: fmt(t0),                      done: true                                  },
    { label: 'AI Triage Started',      time: fmt(t0 ? new Date(t0.getTime() + 60000) : null), done: true },
    { label: 'Priority Assigned',      time: r.priority ? fmt(t0 ? new Date(t0.getTime() + 120000) : null) : '', done: !!r.priority, active: !r.priority },
    { label: 'Rescue Team Notified',   time: ['ASSIGNED','RESOLVED'].includes(r.status) ? fmt(t0 ? new Date(t0.getTime() + 180000) : null) : '', done: ['ASSIGNED','RESOLVED'].includes(r.status), active: !['ASSIGNED','RESOLVED'].includes(r.status) && !!r.priority },
    { label: 'Incident Resolved',      time: r.status === 'RESOLVED' ? fmt(t0 ? new Date(t0.getTime() + 600000) : null) : '', done: r.status === 'RESOLVED' },
  ]
}

const DETECTED_RISKS = { CRITICAL: ['Injury', 'Immediate danger', 'Trapped person'], HIGH: ['Property damage', 'Evacuation needed'], MEDIUM: ['Medical attention needed'], LOW: ['Situation stable'] }
const RECOMMENDATIONS = { CRITICAL: 'Deploy medical rescue team immediately.', HIGH: 'Dispatch rescue unit. High-priority response required.', MEDIUM: 'Assign team and monitor.', LOW: 'Schedule standard welfare check.' }

export const LiveIncidents = () => {
  const { incidents: raw, loading, refetch } = useIncidents(30000)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('All')
  const [selected, setSelected] = useState(null)
  const [response, setResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  // Reset detail when closing
  useEffect(() => { if (!selected) { setResponse(''); setSubmitStatus(null) } }, [selected])

  const filtered = useMemo(() => raw.filter(r => {
    const matchF = filter === 'All' || r.priority === filter || r.status === filter
    const q = search.toLowerCase()
    const matchS = !q || (r.victim_name ?? '').toLowerCase().includes(q) ||
      (r.message ?? '').toLowerCase().includes(q) || (r._id ?? '').includes(q)
    return matchF && matchS
  }), [raw, search, filter])

  const handleSend = async (newStatus) => {
    if (!selected || !response.trim()) return
    setSubmitting(true)
    setSubmitStatus(null)
    try {
      await sendResponse(selected._id, response.trim(), newStatus)
      setSubmitStatus('ok')
      setResponse('')
      refetch()
    } catch {
      setSubmitStatus('err')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="flex h-full min-h-0" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Left: Incident List */}
      <div className={`flex flex-col border-r border-slate-800 bg-slate-950 ${selected ? 'hidden lg:flex w-72 flex-shrink-0' : 'flex-1 lg:w-80 lg:flex-none lg:flex-shrink-0'}`}>
        {/* Search + filters */}
        <div className="flex-shrink-0 p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h1 className="text-white font-bold text-sm">Incident Intelligence</h1>
            {loading && <RefreshCw className="w-3 h-3 text-slate-600 animate-spin ml-auto" />}
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search victim, message, ID…"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {['All', 'CRITICAL', 'HIGH', 'PENDING', 'ASSIGNED', 'RESOLVED'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-slate-700 text-white' : 'text-slate-600 hover:text-slate-400'}`}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* Incident rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {loading && !raw.length
            ? Array(5).fill(0).map((_, i) => <div key={i} className="p-4 animate-pulse"><div className="h-4 bg-slate-800 rounded w-32 mb-2" /><div className="h-3 bg-slate-800 rounded w-48" /></div>)
            : filtered.length === 0
              ? <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <AlertTriangle className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-slate-500 text-xs font-medium">{raw.length === 0 ? 'No incidents yet' : 'No matches'}</p>
                </div>
              : filtered.map(r => {
                  const pc = PC[r.priority] || PC.MEDIUM
                  const sc = SC[r.status]   || SC.PENDING
                  return (
                    <button key={r._id}
                      onClick={() => setSelected(r)}
                      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-900/60 ${selected?._id === r._id ? 'bg-slate-900/80 border-r-2 border-purple-500' : ''}`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${pc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-white text-xs font-bold truncate">{r.victim_name || 'Anonymous'}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>{r.priority || '—'}</span>
                        </div>
                        <p className="text-slate-500 text-[10px] mt-0.5 truncate">{r.message || '—'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold px-1.5 rounded-full ${sc.bg} ${sc.text}`}>{r.status || '—'}</span>
                          {r.created_at && <span className="text-slate-700 text-[10px] font-mono">{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                      </div>
                    </button>
                  )
                })
          }
        </div>
      </div>

      {/* Right: Incident Detail */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Detail header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white lg:hidden p-1">
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-white font-bold text-sm">Incident Analysis</h2>
            </div>
            <button onClick={() => setSelected(null)} className="hidden lg:block text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-5 space-y-4">
            {/* Victim info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Victim Information</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Name',    value: selected.victim_name || 'Anonymous' },
                  { label: 'Status',  value: selected.status || 'PENDING' },
                  { label: 'Reported', value: selected.created_at ? new Date(selected.created_at).toLocaleString() : '—' },
                  ...(selected.latitude ? [{ label: 'GPS', value: `${Number(selected.latitude).toFixed(4)}°, ${Number(selected.longitude).toFixed(4)}°` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-800 rounded-xl p-3">
                    <p className="text-slate-500 text-xs">{label}</p>
                    <p className="text-white text-sm font-semibold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              {selected.message && (
                <div className="mt-3 bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-1">Emergency Message</p>
                  <p className="text-white text-sm leading-relaxed">{selected.message}</p>
                </div>
              )}
            </div>

            {/* AI Triage */}
            <div className={`rounded-2xl border p-5 ${PC[selected.priority]?.bg || 'bg-slate-900'} ${PC[selected.priority]?.border || 'border-slate-800'}`}>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">AI Triage Result</p>
              <div className="flex items-center gap-3 mb-4">
                <div className={`text-3xl font-black ${PC[selected.priority]?.text || 'text-slate-400'}`}>
                  {selected.priority || '—'}
                </div>
              </div>
              {(DETECTED_RISKS[selected.priority] || []).length > 0 && (
                <div className="mb-3">
                  <p className="text-slate-500 text-xs mb-2">Detected Risks</p>
                  <div className="flex flex-wrap gap-2">
                    {(DETECTED_RISKS[selected.priority] || []).map(r => (
                      <span key={r} className="bg-red-500/10 text-red-300 border border-red-500/20 text-xs px-2.5 py-1 rounded-full">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {selected.advice && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">AI Recommendation</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{selected.advice}</p>
                </div>
              )}
              {!selected.advice && RECOMMENDATIONS[selected.priority] && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Recommended Action</p>
                  <p className="text-slate-300 text-sm">{RECOMMENDATIONS[selected.priority]}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-4">Response Timeline</p>
              <div className="space-y-2">
                {buildTimeline(selected).map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${step.done ? 'bg-emerald-500 text-white' : step.active ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700'}`}>
                      {step.done ? '✓' : step.active ? '…' : ''}
                    </span>
                    <p className={`flex-1 text-xs ${step.done ? 'text-white' : step.active ? 'text-blue-300' : 'text-slate-600'}`}>{step.label}</p>
                    {step.time && <span className="text-[10px] font-mono text-slate-700">{step.time}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Operator response */}
            {selected.status !== 'RESOLVED' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Send Response</p>
                <textarea
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  rows={3}
                  placeholder="Type a response for the victim…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 resize-none mb-3"
                />
                {submitStatus === 'ok' && <p className="text-emerald-400 text-xs mb-2">Response sent successfully.</p>}
                {submitStatus === 'err' && <p className="text-red-400 text-xs mb-2">Failed to send. Check backend.</p>}
                <div className="flex gap-2">
                  <button onClick={() => handleSend('ASSIGNED')} disabled={submitting || !response.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm rounded-xl transition-colors">
                    <Send className="w-3.5 h-3.5" /> {submitting ? 'Sending…' : 'Assign & Respond'}
                  </button>
                  <button onClick={() => handleSend('RESOLVED')} disabled={submitting || !response.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm rounded-xl transition-colors">
                    <CheckSquare className="w-3.5 h-3.5" /> Resolve
                  </button>
                </div>
              </div>
            )}
            {selected.response && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                <p className="text-blue-400 text-xs font-semibold mb-1">Last Response Sent</p>
                <p className="text-white text-sm">{selected.response}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex items-center justify-center text-center">
          <div>
            <Brain className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 text-base font-semibold">Select an incident</p>
            <p className="text-slate-700 text-sm mt-1">Full AI analysis and response tools appear here</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveIncidents
