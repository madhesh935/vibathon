import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Clock, Ambulance, RefreshCw,
  MapPin, Shield, Navigation, AlertCircle,
  MessageSquare, Share2, Radio, Users, Phone, Truck,
  ShieldAlert, ChevronRight, HelpCircle, AlertTriangle, Eye
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getReport } from '../../services/api'
import { onStatusUpdated } from '../../services/socket'

const JOURNEY = [
  { key: 'PENDING',      label: 'Request Submitted' },
  { key: 'REVIEWING',    label: 'Under Review'      },
  { key: 'ASSESSED',     label: 'AI Assessment'     },
  { key: 'ASSIGNED',     label: 'Team Assigned'     },
  { key: 'EN_ROUTE',     label: 'En Route'          },
  { key: 'NEARBY',       label: 'Nearby'            },
  { key: 'ARRIVED',      label: 'Arrived'           },
  { key: 'RESOLVED',     label: 'Rescued'           },
]

const statusToStep = s => {
  const m = { PENDING: 0, REVIEWING: 1, ASSESSED: 2, ASSIGNED: 3, EN_ROUTE: 4, NEARBY: 5, ARRIVED: 6, RESOLVED: 7 }
  return m[s?.toUpperCase()] ?? 0
}

const formatTime = (dateStr, offsetMinutes = 0) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  d.setMinutes(d.getMinutes() + offsetMinutes)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}

const userIcon = L.divIcon({
  className: '', iconSize: [24, 24], iconAnchor: [12, 12],
  html: `<div style="position:relative; width:24px; height:24px; display:flex; align-items:center; justify-content:center;">
    <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:#3b82f6; opacity:0.3; animation: pulse 2s infinite;"></div>
    <div style="width:14px; height:14px; border-radius:50%; background:#3b82f6; border:2px solid white; box-shadow: 0 0 10px #3b82f6; z-index: 10;"></div>
  </div>`
})

const vehicleIcon = L.divIcon({
  className: '', iconSize: [32, 32], iconAnchor: [16, 16],
  html: `<div style="position:relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:#ef4444; border-radius:50%; border:2px solid white; box-shadow:0 0 12px rgba(239,68,68,0.6)">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.22-.62l-2.2-2.77a2 2 0 0 0-1.58-.73H14"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/></svg>
  </div>`
})

export const IncidentTracking = () => {
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRef, setLastRef] = useState(new Date())

  const load = useCallback(() => {
    const id = localStorage.getItem('resqmesh_active_incident')
    if (!id) { setLoading(false); setError('no_id'); return }
    setLoading(true)
    getReport(id)
      .then(r => { setReport(r.data); setError(null); setLastRef(new Date()) })
      .catch(e => {
        if (e.status === 404) { localStorage.removeItem('resqmesh_active_incident'); setError('not_found') }
        else setError('fetch_failed')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const unsub = onStatusUpdated(d => {
      const id = localStorage.getItem('resqmesh_active_incident')
      if (d.report_id === id) load()
    })
    return unsub
  }, [load])

  const step = report ? statusToStep(report.status) : 0
  const lat = report?.latitude || 13.0827
  const lng = report?.longitude || 80.2707
  
  const victimPos = [lat, lng]
  const vehiclePos = [lat + 0.003, lng + 0.005]
  const mapCenter = [lat + 0.0015, lng + 0.0025]
  const routeCoords = [vehiclePos, [lat + 0.0015, lng + 0.002], victimPos]

  // Dynamic step times helper
  const getStepTime = (index) => {
    if (!report?.created_at) return null
    if (step < index) return null
    const offsets = [0, 2, 3, 5, 8, 10, 12, 15]
    return formatTime(report.created_at, offsets[index])
  }

  if (!loading && (error === 'no_id' || error === 'not_found')) return (
    <div className="min-h-full flex items-center justify-center p-6 bg-[#0d1117]">
      <div className="max-w-md w-full text-center">
        <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md p-8 rounded-2xl">
          <div className="w-16 h-16 bg-red-950/20 border border-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500"/>
          </div>
          <h2 className="text-white font-bold text-lg mb-2">No Active Rescue</h2>
          <p className="text-slate-400 text-sm mb-6">You don't have an active emergency request. Submit an SOS to get started.</p>
          <button onClick={() => navigate('/victim/report')}
            className="w-full py-3 rounded-xl text-white font-bold text-sm bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
            Report Emergency
          </button>
        </div>
      </div>
    </div>
  )

  if (loading && !report) return (
    <div className="min-h-full bg-[#0d1117]">
      <div className="p-5 space-y-4 animate-pulse">
        <div className="grid grid-cols-4 gap-4 h-24 bg-[#0f172a]/40 rounded-2xl border border-white/5"/>
        <div className="grid grid-cols-3 gap-4 h-64 bg-[#0f172a]/40 rounded-2xl border border-white/5"/>
        <div className="grid grid-cols-4 gap-4 h-56 bg-[#0f172a]/40 rounded-2xl border border-white/5"/>
      </div>
    </div>
  )

  const reqId = report?.id ? `SOS-${report.id.substring(0, 8).toUpperCase()}` : `SOS-${new Date().getFullYear()}-0615-784512`
  const reqDate = report?.created_at ? new Date(report.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
  const reqTime = report?.created_at ? new Date(report.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true }).toUpperCase() : '02:58 PM'

  return (
    <div className="min-h-full bg-[#0d1117] p-3 sm:p-4">
      <div className="space-y-3 sm:space-y-4">
        
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Rescue Status</h1>
            <p className="text-slate-400 text-xs mt-1">Real-time updates of your rescue request and team progress.</p>
          </div>
          <div className="flex items-center gap-3">
            {report?.status === 'RESOLVED' && (
              <button 
                onClick={() => {
                  localStorage.removeItem('resqmesh_active_incident');
                  navigate('/victim');
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
              >
                Dismiss & Return Home
              </button>
            )}
            <button onClick={load} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg border border-white/5 bg-slate-900/50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
            </button>
          </div>
        </div>

        {/* Top 4 Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Box 1: REQUEST ID */}
          <div className="bg-[#0f172a]/60 border border-white/5 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-900/20 border border-blue-800/30 flex items-center justify-center flex-shrink-0 text-blue-400">
              <Shield className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Your Request ID</p>
              <p className="text-white text-xs font-bold font-mono mt-0.5">{reqId}</p>
              <p className="text-slate-400 text-[9px] mt-0.5">Requested {reqDate}, {reqTime}</p>
            </div>
          </div>

          {/* Box 2: CURRENT STATUS (Red alert theme / Green for resolved) */}
          {report?.status === 'RESOLVED' ? (
            <div className="bg-emerald-950/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-3 shadow-sm shadow-emerald-950/20">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/20 border border-emerald-800/30 flex items-center justify-center flex-shrink-0 text-emerald-500">
                <CheckCircle2 className="w-5 h-5"/>
              </div>
              <div>
                <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-wider">Current Status</p>
                <p className="text-emerald-400 text-xs font-bold mt-0.5">Emergency Resolved</p>
                <p className="text-slate-400 text-[9px] mt-0.5">You have been successfully rescued.</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-950/10 border border-red-500/20 p-3 rounded-2xl flex items-center gap-3 shadow-sm shadow-red-950/20">
              <div className="w-10 h-10 rounded-xl bg-red-900/20 border border-red-800/30 flex items-center justify-center flex-shrink-0 text-red-500 animate-pulse">
                <Ambulance className="w-5 h-5"/>
              </div>
              <div>
                <p className="text-red-400 text-[9px] font-bold uppercase tracking-wider">Current Status</p>
                <p className="text-red-400 text-xs font-bold mt-0.5">Rescue Team is On the Way</p>
                <p className="text-slate-400 text-[9px] mt-0.5">Stay calm. Help is 2.4 km away.</p>
              </div>
            </div>
          )}

          {/* Box 3: ESTIMATED ARRIVAL */}
          <div className="bg-[#0f172a]/60 border border-white/5 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-900/20 border border-amber-800/30 flex items-center justify-center flex-shrink-0 text-amber-500">
              <Clock className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Estimated Arrival</p>
              <p className="text-white text-sm font-black mt-0.5">
                {report?.status === 'RESOLVED' ? '—' : '12 min'}
              </p>
              <p className="text-slate-400 text-[9px] mt-0.5">
                {report?.status === 'RESOLVED' ? 'Mission complete' : 'At your location'}
              </p>
            </div>
          </div>

          {/* Box 4: TEAM ASSIGNED */}
          <div className="bg-[#0f172a]/60 border border-white/5 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-900/20 border border-purple-800/30 flex items-center justify-center flex-shrink-0 text-purple-400">
              <Users className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Team Assigned</p>
              <p className="text-white text-xs font-bold mt-0.5">Rescue Team Alpha</p>
              <p className="text-slate-400 text-[9px] mt-0.5">Team Leader: Rahul Kumar</p>
            </div>
          </div>
        </div>

        {/* Middle Section: Rescue Journey & Live Tracking Map */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3 sm:gap-4">
          
          {/* Rescue Journey card */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-bold text-sm">Rescue Journey</p>
                <p className="text-slate-400 text-[10px]">
                  Last updated · {lastRef.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true }).toUpperCase()}
                </p>
              </div>

              {/* Stepper nodes */}
              <div className="flex items-start overflow-x-auto pb-4 scrollbar-none w-full min-h-0">
                {JOURNEY.map((s, i) => {
                  const done = step > i
                  const current = step === i
                  return (
                    <div key={s.key} className="flex flex-col items-center flex-1 min-w-[75px] group">
                      <div className="flex items-center w-full relative">
                        {/* Left Line */}
                        <div className="flex-1 h-0.5" 
                          style={{ background: done ? '#10b981' : current ? 'linear-gradient(90deg, #10b981, rgba(255,255,255,0.08))' : 'rgba(255,255,255,0.04)' }}/>
                        
                        {/* Circle */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${
                          done ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' :
                          current ? 'bg-slate-900 border-red-500 shadow-lg shadow-red-500/20 animate-pulse' :
                          'bg-slate-900 border-white/10'
                        }`}>
                          {done ? <CheckCircle2 className="w-4 h-4 text-white"/> :
                           current ? <Ambulance className="w-4 h-4 text-red-500"/> :
                           <span className="w-2 h-2 rounded-full bg-slate-700"/>}
                        </div>

                        {/* Right Line */}
                        <div className="flex-1 h-0.5" 
                          style={{ background: done && step > i + 1 ? '#10b981' : done && step === i + 1 ? 'linear-gradient(90deg, #10b981, #ef4444)' : 'rgba(255,255,255,0.04)' }}/>
                      </div>
                      
                      <p className={`text-[10px] font-bold mt-2.5 text-center leading-tight transition-colors ${done ? 'text-emerald-400' : current ? 'text-red-500' : 'text-slate-500'}`}>
                        {s.label}
                      </p>
                      {getStepTime(i) && (
                        <p className="text-[9px] text-slate-400 mt-1 font-mono font-semibold">{getStepTime(i)}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Alert Banner under stepper */}
            <div className="mt-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <CheckCircle2 className="w-4 h-4"/>
              </div>
              <p className="text-emerald-400 text-xs font-semibold">
                {report?.status === 'RESOLVED'
                  ? 'Your emergency has been successfully resolved. Thank you for your cooperation.'
                  : step >= 3
                    ? 'Your request has been assigned to Rescue Team Alpha. They are on the way to your location.'
                    : 'Your request is submitted and under AI assessment.'}
              </p>
            </div>
          </div>

          {/* Live Tracking map card */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <p className="text-white font-bold text-sm">Live Tracking</p>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                LIVE
              </span>
            </div>

            {/* Map Container */}
            <div className="h-[150px] rounded-xl overflow-hidden border border-white/5 relative bg-slate-950">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Polyline positions={routeCoords} pathOptions={{ color: '#ef4444', dashArray: '5, 10', weight: 4 }} />
                <Marker position={vehiclePos} icon={vehicleIcon}/>
                <Marker position={victimPos} icon={userIcon}/>
              </MapContainer>
              
              {/* Route floating pill */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl shadow-lg flex flex-col items-center justify-center z-[1000] pointer-events-none">
                <p className="text-[10px] font-black text-white leading-none">2.4 km away</p>
                <p className="text-[9px] text-red-400 font-bold mt-0.5">12 min</p>
              </div>
            </div>

            {/* Map metrics footer */}
            <div className="flex items-center justify-between mt-4 text-xs text-slate-350 bg-slate-900/40 p-3 rounded-xl border border-white/5 flex-shrink-0">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-400"/>
                Vehicle: <strong className="text-white">Rescue Van 1</strong>
              </span>
              <span className="font-semibold text-white">Speed: 45 km/h</span>
            </div>
          </div>
        </div>

        {/* Bottom 4 Grid Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Team Details */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <p className="text-white font-bold text-sm mb-3.5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500"/> Team Details
              </p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Team Name</span>
                  <span className="text-white font-semibold">Rescue Team Alpha</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Team Leader</span>
                  <span className="text-white font-semibold">Rahul Kumar</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Team Members</span>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {['R', 'K', 'A', 'M'].map((letter, idx) => {
                      const gradients = [
                        'from-blue-600 to-blue-800',
                        'from-purple-600 to-purple-800',
                        'from-red-600 to-red-800',
                        'from-emerald-600 to-emerald-800'
                      ]
                      return (
                        <div key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white border border-slate-900 bg-gradient-to-br ${gradients[idx]}`}>
                          {letter}
                        </div>
                      )
                    })}
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-slate-300 border border-slate-900 bg-slate-800">
                      +2
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Vehicle</span>
                  <span className="text-white font-semibold">Rescue Van 1</span>
                </div>
              </div>
            </div>
            
            <a href="tel:+919876543210" className="mt-4 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
              <Phone className="w-3.5 h-3.5"/> Call +91 98765 43210
            </a>
          </div>

          {/* Card 2: What to Expect Next? */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4">
            <p className="text-white font-bold text-sm mb-3.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-500"/> What to Expect Next?
            </p>
            <div className="space-y-3">
              {[
                { title: 'Team will reach your location', desc: 'Estimated in 12 minutes', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', check: true },
                { title: 'Team will assess the situation', desc: 'On arrival', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
                { title: 'You will be assisted to safety', desc: 'Stay calm and follow instructions', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
                { title: 'You will be taken to a safe place', desc: 'Medical help if required', color: 'bg-red-500/10 border-red-500/20 text-red-400' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black border ${step.color}`}>
                    {step.check ? '✓' : idx + 1}
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold leading-tight">{step.title}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Stay Safe Until Help Arrives */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4">
            <p className="text-white font-bold text-sm mb-3.5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500"/> Stay Safe Until Help
            </p>
            <div className="space-y-3">
              {[
                { text: 'Stay in a safe place', color: 'text-amber-400 bg-amber-950/20 border-amber-900/30' },
                { text: 'Keep your phone charged', color: 'text-amber-400 bg-amber-950/20 border-amber-900/30' },
                { text: 'Share your live location', color: 'text-blue-400 bg-blue-950/20 border-blue-900/30' },
                { text: 'Follow team instructions', color: 'text-purple-400 bg-purple-950/20 border-purple-900/30' },
                { text: 'Do not panic', color: 'text-red-400 bg-red-950/20 border-red-900/30' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold border ${item.color}`}>
                    !
                  </span>
                  <span className="text-slate-300 text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Live Updates */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-bold text-sm">Live Updates</p>
                <button onClick={() => navigate('/victim/chat')} className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-0.5">
                  View All <ChevronRight className="w-3.5 h-3.5"/>
                </button>
              </div>

              <div className="space-y-3 max-h-[120px] overflow-y-auto scrollbar-none">
                {[
                  { text: 'Rescue team is on the way to your location.', time: '03:50 PM', color: 'bg-red-500' },
                  { text: 'Team Alpha has been assigned to your case.', time: '03:45 PM', color: 'bg-blue-500' },
                  { text: 'Your emergency is classified as CRITICAL.', time: '03:42 PM', color: 'bg-orange-500' },
                  { text: 'AI assessment of your situation is complete.', time: '03:39 PM', color: 'bg-purple-500' },
                  { text: 'Emergency request received successfully.', time: '03:30 PM', color: 'bg-emerald-500' },
                ].map((update, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${update.color}`}/>
                    <div className="min-w-0">
                      <p className="text-slate-200 text-xs leading-snug">{update.text}</p>
                      <p className="text-slate-400 text-[9px] mt-0.5 font-mono">{update.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => navigate('/victim/chat')} className="mt-3.5 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-350 border border-white/10 hover:bg-white/5 transition-colors">
              <MessageSquare className="w-3.5 h-3.5"/> Message Rescue Operator
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

export default IncidentTracking
