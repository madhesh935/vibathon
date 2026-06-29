import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Clock, ChevronRight, RefreshCw, Navigation,
  AlertCircle, CheckCircle2, Activity, Phone,
  Ambulance, ShieldCheck, Waves, Building2,
  Flame, Wind, Heart, Share2, Locate, Bell, Users,
  Mic, Square, Loader2
} from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getReport, submitViaRelay, enhanceText, transcribeAudio } from '../../services/api'
import { connectSocket, disconnectSocket, onPriorityUpdated, onRescueResponse, onStatusUpdated } from '../../services/socket'

const JOURNEY = [
  'Submitted','Under Review','AI Assessment','Team Assigned','En Route','Nearby','Arrived','Rescued'
]
const journeyIdx = status => {
  const m = { PENDING:0, REVIEWING:1, ASSESSED:2, ASSIGNED:3, EN_ROUTE:4, NEARBY:5, ARRIVED:6, RESOLVED:7 }
  return m[status?.toUpperCase()] ?? 0
}


const SHELTERS = [
  { name:'Community Shelter A', dist:'1.2 km', cap:200, avail:87,  status:'Open',    color:'#10b981' },
  { name:'Relief Camp B',        dist:'2.4 km', cap:350, avail:120, status:'Open',    color:'#10b981' },
  { name:'Safe Zone C',          dist:'3.8 km', cap:150, avail:12,  status:'Limited', color:'#f59e0b' },
]
const HOSPITALS = [
  { name:'City Hospital',    dist:'2.1 km', beds:120, avail:45, status:'Open', color:'#10b981' },
  { name:'General Hospital', dist:'4.3 km', beds:80,  avail:32, status:'Open', color:'#10b981' },
  { name:'Medical Center',   dist:'6.7 km', beds:60,  avail:5,  status:'Busy', color:'#f97316' },
]
const SAFETY_TIPS = [
  { icon:Waves, label:'Flood Safety',    desc:'Stay on high ground', color:'#3b82f6' },
  { icon:Flame, label:'Fire Safety',     desc:'Evacuate immediately', color:'#ef4444' },
  { icon:Wind,  label:'Cyclone Safety',  desc:'Stay indoors, secure objects', color:'#8b5cf6' },
  { icon:Heart, label:'First Aid Guide', desc:'Basic life-saving steps', color:'#ec4899' },
]

const QUICK_ACTIONS = [
  { label:'Report Emergency', icon:AlertCircle, to:'/victim/report',   color:'#ef4444', bg:'#fef2f2' },
  { label:'Track Rescue',     icon:Activity,    to:'/victim/status',   color:'#3b82f6', bg:'#eff6ff' },
  { label:'View Map',         icon:MapPin,      to:'/victim/location', color:'#10b981', bg:'#f0fdf4' },
  { label:'Call for Help',    icon:Phone,       to:'/victim/contacts', color:'#f97316', bg:'#fff7ed' },
]

const ProgressCircle = ({ pct = 60 }) => {
  const r = 52, c = 2 * Math.PI * r
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8"/>
      <circle cx="65" cy="65" r={r} fill="none" stroke="#10b981" strokeWidth="8"
        strokeDasharray={c} strokeDashoffset={c - (pct/100)*c} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1s ease' }}/>
    </svg>
  )
}

export const VictimHome = () => {
  const navigate  = useNavigate()
  const [incident, setIncident] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [gps,      setGps]      = useState(null)
  const [gpsState, setGpsState] = useState('idle')
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const loadIncident = useCallback(() => {
    const id = localStorage.getItem('resqmesh_active_incident')
    if (!id) return
    setLoading(true)
    getReport(id)
      .then(r => setIncident(r.data))
      .catch(e => { if (e.status === 404) { localStorage.removeItem('resqmesh_active_incident'); setIncident(null) } })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadIncident() }, [loadIncident])

  // Subscribe to socket events for live updates
  useEffect(() => {
    const id = localStorage.getItem('resqmesh_active_incident')
    if (!id) return
    const s = connectSocket()
    const unsubPriority = onPriorityUpdated((data) => {
      if (data.report_id === id || data.report?._id === id)
        setIncident(prev => data.report || { ...prev, priority: data.priority, advice: data.advice })
    })
    const unsubResponse = onRescueResponse((data) => {
      if (data.report_id === id || data.report?._id === id)
        setIncident(prev => data.report || { ...prev, response: data.response })
    })
    const unsubStatus = onStatusUpdated((data) => {
      if (data.report_id === id || data.report?._id === id)
        setIncident(prev => data.report || { ...prev, status: data.status })
    })
    return () => { unsubPriority(); unsubResponse(); unsubStatus() }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) { setGpsState('denied'); return }
    setGpsState('locating')
    navigator.geolocation.getCurrentPosition(
      p => { setGps({ lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy) }); setGpsState('found') },
      () => setGpsState('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const startSOSRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser doesn't support audio recording. Please tap 'Report Emergency'.")
      navigate('/victim/report')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

      recorder.onstart = () => setIsRecording(true)

      recorder.onstop = async () => {
        setIsRecording(false)
        stream.getTracks().forEach(t => t.stop()) // release microphone

        if (chunks.length === 0) return

        setIsTranscribing(true)
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })

        try {
          // Send audio file to local speech-service
          const res = await transcribeAudio(audioBlob)
          const transcribedText = res.data.text || res.data.raw_text

          if (!transcribedText) {
             throw new Error("No speech detected.")
          }

          // Auto-submit the AI enhanced report!
          const name = localStorage.getItem('resqmesh_user_name') || 'Voice User'
          const payload = {
            name,
            description: transcribedText,
            latitude: gps?.lat,
            longitude: gps?.lng,
          }
          const submitRes = await submitViaRelay(payload)
          if (submitRes.data.success) {
            const r = submitRes.data.report
            localStorage.setItem('resqmesh_active_incident', r._id || r.packet_id)
            setIncident(r)
          }
        } catch (err) {
          console.error("SOS AI submission failed", err)
          alert("Failed to process Voice SOS. Please tap Quick Actions -> Report Emergency.")
        } finally {
          setIsTranscribing(false)
        }
      }

      recorder.start()
      setMediaRecorder(recorder)
    } catch (err) {
      console.error('Microphone access error', err)
      setIsRecording(false)
      setIsTranscribing(false)
      alert("Microphone access denied. Please allow microphone permissions.")
    }
  }

  const stopSOSRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
  }

  const step   = incident ? journeyIdx(incident.status) : -1
  const pct    = step >= 0 ? Math.round(((step + 1) / JOURNEY.length) * 100) : 0
  const hasInc = !!incident
  const sevC   = incident?.priority === 'CRITICAL' ? '#ef4444' : incident?.priority === 'HIGH' ? '#f97316' : '#3b82f6'

  // Build live updates from real incident data
  const liveUpdates = incident ? [
    incident.response && { msg: `Operator: "${incident.response}"`, time: 'Response received', color: '#10b981' },
    incident.priority && { msg: `AI classified your emergency as ${incident.priority} priority.${incident.advice ? ` Advice: ${incident.advice.slice(0, 60)}…` : ''}`, time: 'AI Assessment', color: '#a855f7' },
    incident.status && incident.status !== 'PENDING' && { msg: `Status updated to ${incident.status}.`, time: 'Status change', color: '#3b82f6' },
    { msg: 'Emergency request received and logged.', time: new Date(incident.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }), color: '#10b981' },
  ].filter(Boolean) : []

  return (
    <div className="h-full grid grid-cols-[1fr_300px] overflow-hidden">

      {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
      <div className="flex flex-col overflow-y-auto gap-4 p-5 scrollbar-none">

        {/* Status Card */}
        <div className="rounded-2xl overflow-hidden flex-shrink-0"
          style={{ background:'linear-gradient(135deg,#0f172a,#1e293b)', border:'1px solid rgba(255,255,255,.08)' }}>
          <div className="flex items-stretch">
            <div className="flex-1 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Current Status</p>
              {hasInc ? (
                <>
                  <h2 className="text-white font-black text-xl leading-tight mb-1">
                    {incident.status === 'RESOLVED' ? 'You have been rescued!'
                      : step >= 4 ? 'Rescue Team Alpha is on the way!'
                      : 'Your request is being processed'}
                  </h2>
                  <p className="text-slate-400 text-xs mb-4">
                    {incident.status === 'RESOLVED' ? 'Your emergency request has been successfully resolved. You can now dismiss this and return to the home screen.'
                      : step >= 4 ? 'Stay calm. Your rescue team is 2.4 km away.'
                      : incident.advice || 'Help is coming. Stay in a safe location.'}
                  </p>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { icon:ShieldCheck, label:'Priority', val:incident.priority||'MEDIUM', color:sevC },
                      { icon:Clock,       label:'ETA',      val:incident.status === 'RESOLVED' ? '—' : '12 min',  color:'#f59e0b' },
                      { icon:Ambulance,   label:'Team',     val:incident.assigned_team||'Alpha-01', color:'#3b82f6' },
                      { icon:Navigation,  label:'Status',   val:incident.status||'PENDING', color:'#10b981' },
                    ].map(({ icon:Icon, label, val, color }) => (
                      <div key={label} className="rounded-xl p-2.5 text-center"
                        style={{ background:'rgba(255,255,255,.05)' }}>
                        <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }}/>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</p>
                        <p className="text-[10px] font-black mt-0.5 truncate" style={{ color }}>{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/victim/status')}
                      className="flex items-center gap-2 bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                      View Details <ChevronRight className="w-3.5 h-3.5"/>
                    </button>
                    {incident.status === 'RESOLVED' && (
                      <button 
                        onClick={() => {
                          localStorage.removeItem('resqmesh_active_incident');
                          setIncident(null);
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        Acknowledge & Clear
                      </button>
                    )}
                    <button onClick={loadIncident} className="text-slate-500 hover:text-white transition-colors">
                      <RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <h2 className="text-white font-black text-xl leading-tight mb-1">One-Click Voice SOS</h2>
                  <p className="text-slate-400 text-[10px] mb-4 text-center">Tap to record. AI will analyze and dispatch help.</p>
                  
                  <button 
                    onClick={isRecording ? stopSOSRecording : startSOSRecording}
                    disabled={isTranscribing}
                    className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all active:scale-95 ${
                      isRecording 
                        ? 'bg-red-500 animate-pulse ring-4 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                        : isTranscribing 
                          ? 'bg-blue-600 ring-4 ring-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                          : 'bg-red-600 hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                    }`}
                  >
                    {isRecording ? <Square className="w-8 h-8 text-white" /> : 
                     isTranscribing ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : 
                     <Mic className="w-8 h-8 text-white" />}
                  </button>
                  <p className={`text-[10px] font-bold mt-3 ${isRecording ? 'text-red-400' : isTranscribing ? 'text-blue-400' : 'text-slate-500'}`}>
                    {isRecording ? 'Recording... Tap to stop' : isTranscribing ? 'AI analyzing emergency...' : 'TAP TO RECORD EMERGENCY'}
                  </p>
                </div>
              )}
            </div>
            <div className="w-40 flex flex-col items-center justify-center p-4 flex-shrink-0">
              <div className="relative">
                <ProgressCircle pct={hasInc ? pct : 0}/>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <Ambulance className="w-8 h-8 text-white"/>
                  {hasInc && <p className="text-white text-[10px] font-bold mt-1">2.4 km</p>}
                </div>
              </div>
              {hasInc && (
                <div className="mt-2 text-center">
                  <p className="text-emerald-400 text-xs font-bold">En Route</p>
                  <p className="text-slate-500 text-[9px]">{pct}% complete</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md rounded-2xl p-4 flex-shrink-0">
          <p className="text-white font-bold text-sm mb-3">Quick Actions</p>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ label, icon:Icon, to, color }) => (
              <button key={label} onClick={() => navigate(to)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-slate-900/50 hover:border-red-500/30 hover:bg-red-500/10 hover:scale-105 transition-all active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shadow-sm border border-white/5">
                  <Icon className="w-5 h-5" style={{ color }}/>
                </div>
                <p className="text-slate-300 text-[10px] font-bold text-center leading-tight">{label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Rescue Journey */}
        <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md rounded-2xl p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-bold text-sm">Rescue Journey</p>
            <button onClick={() => navigate('/victim/status')}
              className="text-red-500 text-xs font-semibold flex items-center gap-1 hover:text-red-600">
              Details <ChevronRight className="w-3 h-3"/>
            </button>
          </div>
          <div className="flex items-start justify-between w-full overflow-x-auto pb-1 scrollbar-none gap-0">
            {JOURNEY.map((s, i) => {
              const done    = step > i
              const current = step === i
              return (
                <div key={s} className="flex flex-col items-center flex-1 min-w-[80px] group cursor-pointer">
                  <div className="flex items-center w-full">
                    {i > 0 && <div className="flex-1 h-0.5" style={{ background:done||current?'#10b981':'rgba(255,255,255,0.08)' }}/>}
                    <div className={`rounded-full flex items-center justify-center flex-shrink-0 border-2 z-10 transition-all duration-300 ${
                      done    ? 'w-8 h-8 bg-emerald-950/60 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                      current ? 'w-9 h-9 bg-red-950/80 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse' :
                                'w-8 h-8 bg-[#0f172a] border-white/10 group-hover:border-white/20'
                    }`}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400"/> :
                       current ? <Ambulance className="w-4.5 h-4.5 text-red-500"/> :
                       <div className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-slate-400 transition-colors"/>}
                    </div>
                    {i < JOURNEY.length-1 && <div className="flex-1 h-0.5" style={{ background:done?'#10b981':'rgba(255,255,255,0.08)' }}/>}
                  </div>
                  <p className={`text-[10px] mt-2 font-bold text-center leading-tight transition-colors ${
                    done ? 'text-emerald-400' : current ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>{s}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom 3 panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-shrink-0">

          {/* Shelters */}
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500"/> Nearby Shelters
              </p>
            </div>
            <div className="space-y-2.5">
              {SHELTERS.map(s => (
                <div key={s.name}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-slate-300 text-[10px] font-semibold leading-tight flex-1 pr-1">{s.name}</p>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{ background:`${s.color}15`, color:s.color }}>{s.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-[9px]">{s.dist} · Cap {s.cap}</p>
                    <p className="text-slate-300 text-[9px]">{s.avail} free</p>
                  </div>
                  {/* capacity bar */}
                  <div className="h-1 bg-slate-900 rounded-full mt-1.5">
                    <div className="h-1 rounded-full" style={{ width:`${Math.round((s.avail/s.cap)*100)}%`, background:s.color }}/>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/victim/location')}
              className="w-full mt-3 text-center text-red-500 text-[10px] font-semibold hover:text-red-600 flex items-center justify-center gap-1">
              View on Map <ChevronRight className="w-3 h-3"/>
            </button>
          </div>

          {/* Hospitals */}
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-red-500"/> Nearby Hospitals
              </p>
            </div>
            <div className="space-y-2.5">
              {HOSPITALS.map(h => (
                <div key={h.name}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-slate-300 text-[10px] font-semibold leading-tight flex-1 pr-1">{h.name}</p>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{ background:`${h.color}15`, color:h.color }}>{h.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-[9px]">{h.dist}</p>
                    <p className="text-slate-300 text-[9px]">{h.avail}/{h.beds} beds</p>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full mt-1.5">
                    <div className="h-1 rounded-full" style={{ width:`${Math.round((h.avail/h.beds)*100)}%`, background:h.color }}/>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/victim/contacts')}
              className="w-full mt-3 text-center text-red-500 text-[10px] font-semibold hover:text-red-600 flex items-center justify-center gap-1">
              Call a Hospital <ChevronRight className="w-3 h-3"/>
            </button>
          </div>

          {/* Safety Tips */}
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500"/> Safety Tips
              </p>
            </div>
            <div className="space-y-2">
              {SAFETY_TIPS.map(({ icon:Icon, label, desc, color }) => (
                <button key={label} onClick={() => navigate('/victim/guide')}
                  className="w-full flex items-center gap-2.5 p-2 hover:bg-white/5 rounded-xl transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:`${color}15` }}>
                    <Icon className="w-4 h-4" style={{ color }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-[10px] font-bold leading-tight">{label}</p>
                    <p className="text-slate-400 text-[9px] mt-0.5 truncate">{desc}</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0"/>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN ═════════════════════════════════════════ */}
      <div className="flex flex-col overflow-y-auto gap-4 p-4 scrollbar-none bg-[#0d1117]"
        style={{ borderLeft:'1px solid rgba(255,255,255,0.04)' }}>

        {/* Live Updates */}
        <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md rounded-2xl overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-500"/> Live Updates
            </p>
            <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded-full bg-red-500">
              {liveUpdates.length}
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {liveUpdates.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Bell className="w-6 h-6 text-slate-600 mx-auto mb-2"/>
                <p className="text-slate-500 text-xs">No active incident updates.</p>
                <p className="text-slate-600 text-[10px] mt-1">Submit an SOS to receive live updates here.</p>
              </div>
            ) : liveUpdates.map((u, i) => (
              <div key={i} className="px-4 py-2.5 flex items-start gap-3 hover:bg-white/5 transition-colors">
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background:u.color }}/>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-xs leading-snug">{u.msg}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{u.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Overview */}
        <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md rounded-2xl overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500"/> Location
            </p>
            <p className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"/> Live
            </p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { label:'Latitude',  val: gps?.lat.toFixed(4) ?? '—' },
                { label:'Longitude', val: gps?.lng.toFixed(4) ?? '—' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-slate-900/50 border border-white/5 rounded-xl p-2.5">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-white text-xs font-bold font-mono mt-0.5">{val}</p>
                </div>
              ))}
            </div>
            <p className={`text-[10px] font-semibold mb-2 ${gpsState==='found'?'text-emerald-500':gpsState==='locating'?'text-amber-500':'text-red-500'}`}>
              {gpsState==='found' ? '● GPS Active — High accuracy' : gpsState==='locating' ? '● Acquiring GPS…' : '○ Location unavailable'}
            </p>
            <div className="rounded-xl overflow-hidden border border-white/5" style={{ height:'110px' }}>
              {gps ? (
                <MapContainer center={[gps.lat, gps.lng]} zoom={14}
                  style={{ height:'100%', width:'100%' }} zoomControl={false} attributionControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"/>
                  <CircleMarker center={[gps.lat, gps.lng]} radius={8}
                    pathOptions={{ fillColor:'#ef4444', fillOpacity:1, color:'white', weight:2 }}/>
                </MapContainer>
              ) : (
                <div className="h-full bg-slate-900/50 flex items-center justify-center flex-col gap-2">
                  <Locate className="w-6 h-6 text-slate-500"/>
                  <p className="text-slate-400 text-xs">Acquiring location…</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={() => navigate('/victim/location')}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-colors">
                <MapPin className="w-3 h-3"/> Full Map
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-colors"
                style={{ background:'#dc2626' }}>
                <Share2 className="w-3 h-3"/> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VictimHome
