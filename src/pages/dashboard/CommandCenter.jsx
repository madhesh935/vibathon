import { useState, useEffect } from 'react'
import {
  AlertTriangle, Droplets, Users, ShieldCheck, Clock,
  ChevronRight, Search, FileText, Home, Activity,
  MapPin, CheckCircle2, MessageSquare, Navigation,
  Ambulance, Ship, Truck, Crosshair, Tent, Cross,
  Radio, Shield, Flame, Building2, Phone, Brain, Signal,
  LifeBuoy, RefreshCw, Wind, Car, MoreHorizontal
} from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getStatistics, getReports } from '../../services/api'
import { connectSocket, onNewReport, onPriorityUpdated, onStatusUpdated } from '../../services/socket'

/* ── TYPE ICONS ─────────────────────────────────────── */
const TYPE_ICON = { flood: Ship, fire: Flame, earthquake: Building2, cyclone: Truck, medical: Ambulance, accident: Truck, collapse: Building2, others: Shield }
const PRIORITY_C = { CRITICAL: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#3b82f6', LOW: '#10b981' }

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  return `${Math.floor(s/3600)}h ago`
}

/* ── Micro Components ────────────────────────────────────── */
const Panel = ({ title, action, children, noPad = false, className = '' }) => (
  <div className={`rounded-xl flex flex-col overflow-hidden bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-lg ${className}`}>
    <div className="flex items-center justify-between px-3 py-2 flex-shrink-0 border-b border-white/5 bg-white/[0.02]">
      <p className="text-white font-bold text-[10px] uppercase tracking-widest">{title}</p>
      {action}
    </div>
    <div className={noPad ? 'flex-1 overflow-hidden flex flex-col' : 'p-3 flex-1 overflow-y-auto scrollbar-none'}>
      {children}
    </div>
  </div>
)

const Sparkline = ({ points, color }) => {
  const min = Math.min(...points), max = Math.max(...points)
  const pts = points.map((p, i) => `${(i / (points.length - 1)) * 40},${12 - ((p - min) / (max - min || 1)) * 12}`).join(' ')
  return (
    <svg width="40" height="12" className="opacity-80" style={{ filter: `drop-shadow(0 0 2px ${color})` }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const TrendArrow = ({ dir, color }) => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5">
    {dir === 'up' ? <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></> :
     dir === 'down' ? <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></> : null}
  </svg>
)

const MapBadge = ({ color, label }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold bg-[#0a0f18]/80 border border-white/10 backdrop-blur-md shadow-lg">
    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
    <span className="text-slate-300 uppercase tracking-wider">{label}</span>
  </div>
)

const createMarkerIcon = (color, value) => {
  return L.divIcon({
    className: '',
    html: `
      <div style="width: 24px; height: 24px; border-radius: 50%; background: ${color}33; border: 1px solid ${color}80; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
        <div style="width: 16px; height: 16px; border-radius: 50%; background: ${color}; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; color: white; box-shadow: 0 0 10px ${color};">
          ${value}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

export const CommandCenter = () => {
  const [stats,   setStats]   = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    Promise.all([getStatistics(), getReports()])
      .then(([sRes, rRes]) => {
        setStats(sRes.data)
        setReports(rRes.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    const s = connectSocket()
    const unsubNew = onNewReport((report) => {
      setReports(prev => { const e = prev.some(r => r._id === report._id); return e ? prev : [report, ...prev] })
      setStats(prev => prev ? { ...prev, total: prev.total + 1, pending: prev.pending + 1 } : prev)
    })
    const unsubPri = onPriorityUpdated(({ report }) => {
      if (report) setReports(prev => prev.map(r => r._id === report._id ? report : r))
    })
    const unsubSt = onStatusUpdated(({ report }) => {
      if (report) {
        setReports(prev => prev.map(r => r._id === report._id ? report : r))
        // Refresh stats on status change
        getStatistics().then(r => setStats(r.data)).catch(() => {})
      }
    })
    return () => { unsubNew(); unsubPri(); unsubSt() }
  }, [])

  // Build KPIs from real stats + reports
  const kpis = [
    {
      label: 'Active Incidents', color: '#ef4444', icon: AlertTriangle, trend: 'up', subColor: '#ef4444',
      value: stats ? String(stats.pending + (stats.assigned || 0)) : '—',
      sub: stats ? `${stats.total} total reports` : 'Loading…',
      spark: [4, 5, 7, 6, 8, 12, 16, 20, 22, stats?.pending ?? 24],
    },
    {
      label: 'Critical Alerts', color: '#ef4444', icon: Flame, trend: 'up', subColor: '#ef4444',
      value: stats ? String(stats.critical) : '—',
      sub: `${stats?.high ?? 0} HIGH priority`,
      spark: [1, 1, 2, 2, 3, 4, 5, 6, stats?.high ?? 6, stats?.critical ?? 7],
    },
    {
      label: 'Total Reports', color: '#3b82f6', icon: Ambulance, trend: 'none', subColor: '#60a5fa',
      value: stats ? String(stats.total) : '—',
      sub: 'All time submissions',
      spark: [5, 8, 12, 15, 18, 22, 26, 30, stats?.total ?? 35, stats?.total ?? 40],
    },
    {
      label: 'Pending Triage', color: '#f59e0b', icon: Users, trend: 'none', subColor: '#fbbf24',
      value: stats ? String(stats.pending) : '—',
      sub: 'Awaiting assignment',
      spark: [40, 45, 55, 60, 75, 80, 85, 90, stats?.pending ?? 94, stats?.pending ?? 96],
    },
    {
      label: 'Resolved', color: '#10b981', icon: LifeBuoy, trend: 'up', subColor: '#34d399',
      value: stats ? String(stats.resolved) : '—',
      sub: 'Successfully rescued',
      spark: [20, 25, 28, 30, 35, 40, 45, 48, 50, stats?.resolved ?? 52],
    },
    {
      label: 'Assigned Teams', color: '#a855f7', icon: Clock, trend: 'none', subColor: '#34d399',
      value: stats ? String(stats.assigned) : '—',
      sub: 'Currently responding',
      spark: [18, 17, 16, 16, 15, 14, 14, 13, 13, stats?.assigned ?? 12],
    },
  ]

  // Build live feed from real reports (newest 5)
  const liveFeed = reports.slice(0, 5).map(r => ({
    id: r._id?.slice(-8).toUpperCase() || '—',
    type: r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : 'Emergency',
    loc: r.latitude && r.longitude ? `${Number(r.latitude).toFixed(3)}, ${Number(r.longitude).toFixed(3)}` : r.victim_name || 'Unknown location',
    time: timeAgo(r.created_at),
    prio: r.priority || 'MEDIUM',
    c: PRIORITY_C[r.priority] || PRIORITY_C.MEDIUM,
    Icon: TYPE_ICON[r.type] || Shield,
    vics: 1,
  }))

  // Build map markers from reports with GPS
  const mapMarkers = reports
    .filter(r => r.latitude && r.longitude)
    .slice(0, 10)
    .map(r => ({
      id: r._id,
      lat: Number(r.latitude),
      lng: Number(r.longitude),
      value: 1,
      color: PRIORITY_C[r.priority] || PRIORITY_C.MEDIUM,
      label: r.victim_name || 'Victim',
      desc: r.message?.slice(0, 50) || 'Emergency report',
    }))

  // Fallback static markers when no GPS data available
  const MAP_MARKERS = mapMarkers.length > 0 ? mapMarkers : [
    { id: 'M1', lat: 13.0827, lng: 80.2707, value: stats?.critical || 5, color: '#ef4444', label: 'Chennai Central', desc: 'Critical Flood Zone' },
    { id: 'M2', lat: 13.0400, lng: 80.2400, value: stats?.high || 8, color: '#3b82f6', label: 'T. Nagar', desc: 'Active Rescue Operations' },
  ]

  const MISSIONS = reports
    .slice(0, 10)
    .map((r, i) => ({
      id: r._id?.slice(-10).toUpperCase() || `M-${i}`,
      name: r.message?.slice(0, 40) || `Mission ${i + 1}`,
      dist: r.latitude && r.longitude ? `${Number(r.latitude).toFixed(2)}, ${Number(r.longitude).toFixed(2)}` : 'Unknown',
      type: r.type || 'Emergency',
      sev: r.priority || 'MEDIUM',
      progress: r.status === 'RESOLVED' ? 100 : r.status === 'ASSIGNED' ? 40 : r.status === 'EN_ROUTE' ? 70 : 10,
      off: r.assigned_team || 'Pending',
      c: PRIORITY_C[r.priority] || PRIORITY_C.MEDIUM,
      status: r.status || 'PENDING'
    }))

  return (
    <div className="h-full flex gap-3 overflow-hidden text-slate-200 relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex-1 flex flex-col z-10 w-full max-w-[1600px] mx-auto">
        
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-shrink-0 mb-3 px-1">
          <div>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-0.5 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Command & Control
            </p>
            <h1 className="text-white font-black text-xl tracking-tight">Global Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[9px] text-slate-300 flex items-center gap-1.5 font-bold bg-[#111827]/80 border border-white/10 px-2.5 py-1 rounded-md backdrop-blur-sm shadow-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                System <span className="text-emerald-400 ml-0.5">Online</span>
             </div>
          </div>
        </div>

        {/* ── Main Scrollable Content ──────────────────────── */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-none pb-2 space-y-3">

          {/* ── Top KPI Row ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 flex-shrink-0">
            {kpis.map(k => (
              <div key={k.label} className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl p-3 shadow-md relative overflow-hidden group transition-colors">
                <div className={`absolute -right-8 -bottom-8 w-16 h-16 rounded-full blur-xl pointer-events-none transition-colors duration-500 opacity-20`} style={{ background: k.color }} />
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors" style={{ background: `${k.color}15`, borderColor: `${k.color}30` }}>
                    <k.icon className="w-4 h-4" style={{ color: k.color }} />
                  </div>
                  <Sparkline points={k.spark} color={k.color} />
                </div>
                <div className="relative z-10">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{k.label}</p>
                  <p className="text-lg font-black text-white tracking-tight">{k.value}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] font-bold" style={{ color: k.subColor }}>
                    {k.trend !== 'none' && <TrendArrow dir={k.trend} color={k.subColor} />}
                    {k.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Middle Row: Map & Feed ───────────────────────────── */}
          <div className="grid grid-cols-12 gap-3 flex-shrink-0" style={{ height: '370px' }}>
            
            {/* Disaster Map */}
            <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
              <Panel title="Disaster Map - Live" action={<div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"/><span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Live View</span></div>} noPad className="flex-1">
                <div className="flex-1 relative bg-[#0a0f18] rounded-b-xl overflow-hidden shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]">
                  <MapContainer center={[13.04, 80.20]} zoom={12} style={{ height: '100%', width: '100%', background: 'transparent' }} zoomControl={false} attributionControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    {MAP_MARKERS.map(marker => (
                      <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={createMarkerIcon(marker.color, marker.value)}>
                        <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                           <div className="text-[9px] font-bold text-slate-800 uppercase tracking-widest">{marker.label}</div>
                           <div className="text-[8px] text-slate-500">{marker.desc}</div>
                        </Tooltip>
                      </Marker>
                    ))}
                    <Circle center={[13.0827, 80.2707]} pathOptions={{ fillColor: '#ef4444', fillOpacity: 0.15, color: 'transparent' }} radius={3000} className="animate-pulse" />
                    <Circle center={[13.0400, 80.2400]} pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.1, color: 'transparent' }} radius={4000} />
                  </MapContainer>

                  {/* Controls */}
                  <div className="absolute top-3 right-3 bg-[#0a0d14]/80 border border-white/10 rounded-md p-1.5 flex gap-3 backdrop-blur-sm shadow-md z-[1000]">
                    <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-300 cursor-pointer hover:text-white transition-colors"><input type="checkbox" defaultChecked className="accent-blue-500 w-2.5 h-2.5" /> Incidents</label>
                    <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-300 cursor-pointer hover:text-white transition-colors"><input type="checkbox" defaultChecked className="accent-blue-500 w-2.5 h-2.5" /> Teams</label>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-3 left-3 flex gap-2 z-[1000]">
                    <MapBadge color="#ef4444" label="Critical Area" />
                    <MapBadge color="#3b82f6" label="Rescue Active" />
                  </div>

                  {/* Vignette Overlay */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(10,13,20,1)]" />
                </div>
              </Panel>
            </div>

            {/* Live Incident Feed */}
            <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
              <Panel title="Live Incident Feed" action={<div className="flex items-center gap-1.5"><Signal className="w-3 h-3 text-blue-400 animate-pulse"/></div>} noPad className="flex-1">
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-none">
                  {liveFeed.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-center">
                      <p className="text-slate-500 text-xs">No reports yet.<br/>Submit an SOS to see live data.</p>
                    </div>
                  ) : liveFeed.map(f => (
                    <div key={f.id} className="p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all bg-[#0a0f18]/60 border border-white/5 shadow-sm group relative"
                      style={{ borderLeft: `2px solid ${f.c}` }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center border group-hover:scale-110 transition-transform shadow-inner" style={{ background: `${f.c}15`, borderColor: `${f.c}30` }}>
                            <f.Icon className="w-3.5 h-3.5" style={{ color: f.c }} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors">{f.id}</p>
                             <p className="text-[8px] text-slate-400 uppercase tracking-widest">{f.type}</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm"
                          style={{ background: `${f.c}15`, color: f.c, border: `1px solid ${f.c}30` }}>{f.prio}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] mt-1.5 pt-1.5 border-t border-white/5">
                         <div className="flex items-center gap-1 text-slate-300 font-bold">
                            <MapPin className="w-2.5 h-2.5 text-slate-400" /> {f.loc}
                         </div>
                         <p className="text-slate-500">{f.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

          </div>

          {/* ── Bottom Row: Active Rescue Missions ──────────────────────────── */}
          <div className="flex-shrink-0 pb-2">
            <Panel title="ACTIVE RESCUE MISSIONS" action={<span className="text-[9px] text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-white/5 shadow-inner">{MISSIONS.length} MISSIONS</span>} noPad>
              <div className="w-full overflow-x-auto scrollbar-none">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0f172a]/80 text-[9px] text-slate-400 uppercase tracking-widest">
                      <th className="font-bold py-3 px-4 w-1/4">Mission ID</th>
                      <th className="font-bold py-3 px-4">Location</th>
                      <th className="font-bold py-3 px-4">Type</th>
                      <th className="font-bold py-3 px-4">Severity</th>
                      <th className="font-bold py-3 px-4 w-32">Progress</th>
                      <th className="font-bold py-3 px-4">Commander</th>
                      <th className="font-bold py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {MISSIONS.map(inv => (
                      <tr key={inv.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                        <td className="py-2.5 px-4">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 w-6 h-6 rounded-md flex items-center justify-center border shadow-inner" style={{ background: `${inv.c}10`, borderColor: `${inv.c}30` }}>
                               <Shield className="w-3 h-3" style={{ color: inv.c }} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors">{inv.name}</p>
                              <p className="text-[8px] text-slate-500 uppercase tracking-widest">{inv.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <p className="text-[10px] text-slate-300 font-bold">{inv.dist}</p>
                        </td>
                        <td className="py-2.5 px-4">
                          <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">{inv.type}</p>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm"
                            style={{ background: `${inv.c}15`, color: inv.c, border: `1px solid ${inv.c}30` }}>
                            {inv.sev}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                              <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${inv.progress}%`, background: '#3b82f6' }}>
                                 <div className="absolute inset-0 bg-white/20 animate-pulse"/>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-blue-400 w-7">{inv.progress}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <p className="text-[10px] text-slate-300 font-bold flex items-center gap-1.5"><UserIcon className="w-3 h-3 text-slate-500"/> {inv.off}</p>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button className="text-[9px] font-bold text-blue-400 border border-blue-500/30 rounded-md px-3 py-1.5 hover:bg-blue-500/10 hover:border-blue-400 transition-all flex items-center gap-1.5 ml-auto shadow-sm">
                            View Map <MapPin className="w-3 h-3"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

        </div>
      </div>
    </div>
  )
}

const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)

export default CommandCenter
