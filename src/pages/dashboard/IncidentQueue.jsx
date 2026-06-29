import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, Droplets, Building2, Activity, Flame, Shield, AlertTriangle, Car, Wind, MoreHorizontal, RefreshCw, MessageSquare, CheckCircle2 } from 'lucide-react'
import { getReports, sendResponse } from '../../services/api'
import { connectSocket, onNewReport, onPriorityUpdated, onStatusUpdated } from '../../services/socket'
import { RespondModal } from './RespondModal'

const TYPE_ICON = {
  flood:     Droplets,
  earthquake:Building2,
  fire:      Flame,
  cyclone:   Wind,
  medical:   Activity,
  accident:  Car,
  collapse:  Building2,
  others:    MoreHorizontal,
}

const PRIORITY_COLOR = {
  CRITICAL: { bg:'bg-red-500/20',    text:'text-red-500',    border:'border-red-500/30'    },
  HIGH:     { bg:'bg-orange-500/20', text:'text-orange-500', border:'border-orange-500/30' },
  MEDIUM:   { bg:'bg-blue-500/20',   text:'text-blue-500',   border:'border-blue-500/30'   },
  LOW:      { bg:'bg-green-500/20',  text:'text-green-500',  border:'border-green-500/30'  },
}

const ICON_COLOR = { CRITICAL:'#ef4444', HIGH:'#f59e0b', MEDIUM:'#3b82f6', LOW:'#10b981' }

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

const PAGE_SIZE = 10

export const IncidentQueue = () => {
  const [reports,   setReports]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [filter,    setFilter]    = useState('ALL')
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(1)
  const [respondingTo, setRespondingTo] = useState(null)

  const loadReports = () => {
    setLoading(true)
    setError(null)
    getReports()
      .then(r => setReports(r.data || []))
      .catch(() => setError('Unable to load reports. Is the backend running?'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReports()

    const s = connectSocket()
    const unsubNew     = onNewReport((report) => setReports(prev => {
      const exists = prev.some(r => r._id === report._id)
      return exists ? prev : [report, ...prev]
    }))
    const unsubPriority = onPriorityUpdated(({ report }) => {
      if (report) setReports(prev => prev.map(r => r._id === report._id ? report : r))
    })
    const unsubStatus = onStatusUpdated(({ report }) => {
      if (report) setReports(prev => prev.map(r => r._id === report._id ? report : r))
    })
    return () => { unsubNew(); unsubPriority(); unsubStatus() }
  }, [])

  // Filter & search
  const filtered = useMemo(() => {
    let list = reports
    if (filter !== 'ALL') list = list.filter(r => r.priority === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r._id?.toLowerCase().includes(q) ||
        r.victim_name?.toLowerCase().includes(q) ||
        r.message?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
      )
    }
    return list
  }, [reports, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Count by priority
  const counts = useMemo(() => ({
    ALL:      reports.length,
    CRITICAL: reports.filter(r => r.priority === 'CRITICAL').length,
    HIGH:     reports.filter(r => r.priority === 'HIGH').length,
    MEDIUM:   reports.filter(r => r.priority === 'MEDIUM').length,
    LOW:      reports.filter(r => r.priority === 'LOW').length,
  }), [reports])

  return (
    <div className="h-full flex gap-3">
      
      <div className="flex-1 flex flex-col min-w-0 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight mb-1">Incident Queue</h1>
            <p className="text-[11px] text-slate-400">Live incoming incidents from all sources</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadReports} disabled={loading}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
            </button>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              Network<br/><span className="text-emerald-500">Online</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              AI Engine<br/><span className="text-emerald-500">Active</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex gap-2 flex-wrap">
            {[
              { key:'ALL',      label:`All (${counts.ALL})`,            textC:'text-blue-400',  bgC:'bg-blue-600' },
              { key:'CRITICAL', label:`Critical (${counts.CRITICAL})`,  textC:'text-red-500',   bgC:'bg-red-500/20' },
              { key:'HIGH',     label:`High (${counts.HIGH})`,          textC:'text-orange-500',bgC:'bg-orange-500/20' },
              { key:'MEDIUM',   label:`Medium (${counts.MEDIUM})`,      textC:'text-blue-500',  bgC:'bg-blue-500/20' },
              { key:'LOW',      label:`Low (${counts.LOW})`,            textC:'text-green-500', bgC:'bg-green-500/20' },
            ].map(({ key, label, textC, bgC }) => (
              <button key={key} onClick={() => { setFilter(key); setPage(1) }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                  filter === key
                    ? `${bgC} text-white border-transparent`
                    : `bg-[#121822] ${textC} border-white/10 hover:bg-white/5`
                }`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search incidents..."
                className="w-56 bg-[#121822] border border-white/10 text-white text-[11px] placeholder-slate-500 rounded-lg pl-8 pr-4 py-1.5 focus:outline-none focus:border-white/20" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-5">
          {error ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2"/>
                <p className="text-red-400 text-sm font-semibold">{error}</p>
                <button onClick={loadReports} className="mt-3 text-xs text-slate-400 hover:text-white underline">
                  Retry
                </button>
              </div>
            </div>
          ) : loading && reports.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <RefreshCw className="w-6 h-6 text-slate-500 mx-auto mb-2 animate-spin"/>
                <p className="text-slate-400 text-sm">Loading incidents…</p>
              </div>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2"/>
                <p className="text-slate-400 text-sm font-semibold">No incidents found</p>
                <p className="text-slate-600 text-xs mt-1">
                  {search ? 'Try a different search term.' : 'No reports have been submitted yet.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#121822] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    {['ID', 'Victim', 'Message', 'Priority', 'Status', 'Reported'].map(h => (
                      <th key={h} className="py-3.5 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">{h}</th>
                    ))}
                    <th className="py-3.5 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginated.map(inc => {
                    const priority = inc.priority || 'MEDIUM'
                    const pc = PRIORITY_COLOR[priority] || PRIORITY_COLOR.MEDIUM
                    const ic = ICON_COLOR[priority] || '#3b82f6'
                    const Icon = TYPE_ICON[inc.type] || Shield
                    return (
                      <tr key={inc._id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                        <td className="py-3.5 px-5">
                          <span className="text-[11px] font-bold text-slate-300 font-mono">{inc._id?.slice(-8).toUpperCase()}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-slate-800/50 flex items-center justify-center border border-white/5">
                              <Icon className="w-3 h-3" style={{ color: ic }} />
                            </div>
                            <span className="text-[11px] font-bold text-white">{inc.victim_name || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-[11px] text-slate-400 max-w-[200px]">
                          <span className="truncate block">{inc.message?.slice(0, 60) || '—'}{inc.message?.length > 60 ? '…' : ''}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${pc.bg} ${pc.text} ${pc.border}`}>
                            {priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[11px] text-slate-400">{inc.status || 'PENDING'}</td>
                        <td className="py-3.5 px-5 text-[11px] text-slate-500">{timeAgo(inc.created_at)}</td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          {inc.status !== 'RESOLVED' && (
                            <button 
                              onClick={async (e) => { 
                                e.stopPropagation()
                                try { await sendResponse(inc._id, 'Incident has been resolved and closed.', 'RESOLVED'); loadReports() }
                                catch (err) { console.error(err) }
                              }}
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 rounded-lg px-3 py-1.5 hover:bg-emerald-500/10 hover:border-emerald-400 transition-all shadow-sm mr-2"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Resolve
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setRespondingTo(inc) }}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-400 border border-blue-500/30 rounded-lg px-3 py-1.5 hover:bg-blue-500/10 hover:border-blue-400 transition-all shadow-sm"
                          >
                            <MessageSquare className="w-3 h-3" /> Respond
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-slate-500 hover:bg-white/5 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4"/>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = i + Math.max(1, page - 2)
                if (pg > totalPages) return null
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                      pg === page ? 'bg-blue-600 text-white' : 'border border-white/5 text-slate-400 hover:bg-white/5'
                    }`}>{pg}</button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-slate-500 hover:bg-white/5 disabled:opacity-30">
                <ChevronRight className="w-4 h-4"/>
              </button>
              <span className="text-slate-500 text-[11px] ml-2">
                {filtered.length} total · Page {page}/{totalPages}
              </span>
            </div>
          )}
        </div>
      </div>

      {respondingTo && (
        <RespondModal 
          incident={respondingTo}
          onClose={() => setRespondingTo(null)}
          onSuccess={() => {
            setRespondingTo(null)
            loadReports() // Refresh table
          }}
        />
      )}
    </div>
  )
}

export default IncidentQueue
