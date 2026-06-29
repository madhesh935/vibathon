import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Droplets, Flame, Building2, Heart, AlertTriangle, UserPlus,
  MapPin, ChevronRight, CheckCircle2, Loader2, Copy,
  Navigation, Car, Wind, MoreHorizontal,
  Shield, Users, Ambulance, Phone, Crosshair,
  Mic, Square
} from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { submitSOS, submitViaRelay, enhanceText, transcribeAudio } from '../../services/api'

const TYPES = [
  { id:'flood',     Icon:Droplets,      label:'Flood',            desc:'Heavy rain, water logging, inundation',  color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe' },
  { id:'earthquake',Icon:Building2,     label:'Earthquake',       desc:'Building shaking, structural damage',    color:'#f59e0b', bg:'#fffbeb', border:'#fde68a' },
  { id:'fire',      Icon:Flame,         label:'Fire',             desc:'Fire outbreak, smoke, flames',           color:'#ef4444', bg:'#fef2f2', border:'#fecaca' },
  { id:'cyclone',   Icon:Wind,          label:'Cyclone',          desc:'Strong winds, storm, cyclone',           color:'#8b5cf6', bg:'#f5f3ff', border:'#ddd6fe' },
  { id:'medical',   Icon:Heart,         label:'Medical',          desc:'Medical emergency, injuries',            color:'#ec4899', bg:'#fdf2f8', border:'#fbcfe8' },
  { id:'accident',  Icon:Car,           label:'Accident',         desc:'Road accident, collision',               color:'#f97316', bg:'#fff7ed', border:'#fed7aa' },
  { id:'collapse',  Icon:Building2,     label:'Building Collapse',desc:'Building or structure collapse',         color:'#eab308', bg:'#fefce8', border:'#fef08a' },
  { id:'others',    Icon:MoreHorizontal,label:'Others',           desc:'Other types of emergencies',             color:'#64748b', bg:'#f8fafc', border:'#e2e8f0' },
]

const STEPS = [
  { n:1, label:'Type'     },
  { n:2, label:'Details'  },
  { n:3, label:'People'   },
  { n:4, label:'Location' },
  { n:5, label:'Review'   },
]

const SEVERITY = [
  { id:'low',      label:'Low',      color:'#10b981' },
  { id:'medium',   label:'Medium',   color:'#f59e0b' },
  { id:'high',     label:'High',     color:'#f97316' },
  { id:'critical', label:'Critical', color:'#ef4444' },
]

const NEXT_STEPS = [
  { Icon:Shield,    label:'We receive your report', desc:"Your report will be sent to our control center", color:'#3b82f6' },
  { Icon:Users,     label:'Team is assigned',        desc:'Nearest available rescue team will be assigned', color:'#10b981' },
  { Icon:Ambulance, label:'Rescue on the way',        desc:"You can track the team's live location",         color:'#f97316' },
  { Icon:Heart,     label:'Help is provided',         desc:'Our team will reach you and provide assistance', color:'#ef4444' },
]

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all bg-slate-900/50 placeholder-slate-500'

const Label = ({ children, required }) => (
  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
)

export const SendSOS = () => {
  const navigate = useNavigate()
  const [step,       setStep]       = useState(1)
  const [type,       setType]       = useState('')
  const [name,       setName]       = useState(() => localStorage.getItem('resqmesh_user_name') || '')
  const [title,      setTitle]      = useState('')
  const [desc,       setDesc]       = useState('')
  const [severity,   setSeverity]   = useState('')
  const [priority,   setPriority]   = useState('')
  const [when,       setWhen]       = useState('')
  const [adults,     setAdults]     = useState(1)
  const [children,   setChildren]   = useState(0)
  const [injured,    setInjured]    = useState(0)
  const [gps,        setGps]        = useState(null)
  const [gpsState,   setGpsState]   = useState('idle')
  const [address,    setAddress]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(null)
  const [error,      setError]      = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) { setGpsState('denied'); return }
    setGpsState('locating')
    navigator.geolocation.getCurrentPosition(
      p => { setGps({ lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy) }); setGpsState('found') },
      () => setGpsState('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser doesn't support audio recording.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

      recorder.onstart = () => {
        setIsRecording(true)
        setError(null)
      }

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

          setDesc(prev => prev ? `${prev}\n\n[Voice AI Report]: ${transcribedText}` : transcribedText)
        } catch (err) {
          console.error("Transcription failed", err)
          setError("Speech transcription failed.")
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
      setError("Microphone access denied. Please allow microphone permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter your name before submitting.'); return }
    setSubmitting(true); setError(null)
    const victimName = name.trim()
    const payload = {
      victim_name: victimName,
      type, description: desc || title,
      people_count: adults + children,
      injured_count: injured,
      latitude: gps?.lat, longitude: gps?.lng,
    }
    try {
      const r = await submitSOS(payload)
      const id = r.data?.report?._id || r.data?._id || r.data?.id
      if (id) localStorage.setItem('resqmesh_active_incident', id)
      localStorage.setItem('resqmesh_user_name', victimName)
      setSubmitted(r.data?.report || r.data)
    } catch (err) {
      console.error('[SOS] Direct submit failed:', err?.response?.data || err?.message || err)
      try {
        const r = await submitViaRelay(payload)
        const id = r.data?.report?._id || r.data?._id || r.data?.id
        if (id) localStorage.setItem('resqmesh_active_incident', id)
        localStorage.setItem('resqmesh_user_name', victimName)
        setSubmitted(r.data?.report || r.data)
      } catch (relayErr) {
        console.error('[SOS] Relay submit also failed:', relayErr?.message || relayErr)
        setError('Could not submit. Check your connection and try again.')
      }
    } finally { setSubmitting(false) }
  }

  /* ── Success screen ─────────────────────────────── */
  if (submitted) return (
    <div className="h-full overflow-y-auto scrollbar-none flex items-center justify-center p-6 bg-[#0d1117]">
      <div className="max-w-md w-full bg-[#0f172a]/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/5 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-white"/>
          </div>
          <h2 className="text-white font-black text-xl">SOS Submitted!</h2>
          <p className="text-emerald-100 text-sm mt-1">Rescue teams have been notified.</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 rounded-xl">
            <p className="text-slate-400 text-sm">Incident ID</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-bold font-mono">{(submitted._id||'').slice(-10).toUpperCase()}</p>
              <button onClick={() => navigator.clipboard.writeText(submitted._id||'')} className="text-slate-400 hover:text-white">
                <Copy className="w-3.5 h-3.5"/>
              </button>
            </div>
          </div>
          {[
            { label:'Status',   value:'Pending AI Assessment' },
            { label:'Type',     value: type },
            { label:'Location', value: gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'Manual input' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 rounded-xl">
              <p className="text-slate-400 text-sm">{label}</p>
              <p className="text-white text-sm font-semibold capitalize">{value}</p>
            </div>
          ))}
          <div className="pt-2 space-y-2">
            <button onClick={() => navigate('/victim/status')}
              className="w-full py-3 rounded-xl text-white font-bold text-sm"
              style={{ background:'#dc2626' }}>
              Track Rescue Status
            </button>
            <button onClick={() => navigate('/victim')}
              className="w-full py-3 rounded-xl font-bold text-sm border border-white/10 text-slate-300 hover:bg-white/5">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const canNext = step === 1 ? !!type : step === 2 ? (!!title || !!desc) && !!name.trim() : true

  return (
    <div className="h-full overflow-hidden bg-[#0d1117]">
      <div className="h-full grid grid-cols-[1fr_340px]">

        {/* ══ LEFT: scrollable form ═══════════════════════════ */}
        <div className="h-full overflow-y-auto scrollbar-none p-5">

          {/* Page title */}
          <div className="mb-4">
            <h1 className="text-white font-black text-xl">Report Emergency</h1>
            <p className="text-slate-400 text-sm mt-0.5">Provide accurate information to help us respond faster.</p>
          </div>

          {/* Step indicator */}
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md px-5 py-4 rounded-2xl mb-5">
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      step > s.n  ? 'bg-emerald-500 border-emerald-500 text-white' :
                      step === s.n ? 'border-red-500 text-red-500 bg-red-950/30' :
                                     'border-white/10 text-slate-500 bg-slate-900'
                    }`}>
                      {step > s.n ? <CheckCircle2 className="w-4 h-4"/> : s.n}
                    </div>
                    <p className={`text-[10px] mt-1 font-semibold ${
                      step === s.n ? 'text-red-500' : step > s.n ? 'text-emerald-500' : 'text-slate-500'
                    }`}>{s.label}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 mb-3" style={{ background: step > s.n ? '#10b981' : 'rgba(255,255,255,0.08)' }}/>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Step 1: Emergency Type ──────────────────── */}
          {step === 1 && (
            <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md p-5 rounded-2xl mb-5">
              <p className="text-white font-bold text-sm mb-0.5">1. Select Emergency Type</p>
              <p className="text-slate-400 text-xs mb-4">Choose the type of emergency you are facing</p>
              <div className="grid grid-cols-4 gap-3">
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center"
                    style={{
                      background:   type===t.id ? `${t.color}15` : 'rgba(15,23,42,0.3)',
                      borderColor:  type===t.id ? t.color : 'rgba(255,255,255,0.05)',
                      boxShadow:    type===t.id ? `0 0 10px ${t.color}20` : 'none',
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${t.color}15` }}>
                      <t.Icon className="w-5 h-5" style={{ color:t.color }}/>
                    </div>
                    <p className="text-white text-xs font-bold leading-tight">{t.label}</p>
                    <p className="text-slate-400 text-[9px] leading-tight">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Emergency Details ───────────────── */}
          {step === 2 && (
            <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md p-5 rounded-2xl mb-5">
              <p className="text-white font-bold text-sm mb-0.5">2. Emergency Details</p>
              <p className="text-slate-400 text-xs mb-4">Tell us what is happening</p>
              <div className="space-y-4">
                <div>
                  <Label required>Your Name</Label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="E.g., Priya Sharma"
                    className={inputCls}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>Emergency Title</Label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="E.g., Heavy flooding in my area"
                      className={inputCls}/>
                  </div>
                  <div>
                    <Label required>Severity Level</Label>
                    <div className="flex gap-2">
                      {SEVERITY.map(s => (
                        <button key={s.id} onClick={() => setSeverity(s.id)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                          style={{
                            borderColor: severity===s.id ? s.color : 'rgba(255,255,255,0.05)',
                            background:  severity===s.id ? `${s.color}25` : 'rgba(15,23,42,0.3)',
                            color:       severity===s.id ? s.color : '#64748b',
                          }}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <Label required>Description</Label>
                    <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isTranscribing}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                        isRecording 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' 
                          : isTranscribing 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700'
                      }`}
                    >
                      {isRecording ? <><Square className="w-3 h-3"/> Stop</> : 
                       isTranscribing ? <><Loader2 className="w-3 h-3 animate-spin"/> Transcribing</> : 
                       <><Mic className="w-3 h-3"/> Speak</>}
                    </button>
                  </div>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
                    placeholder="Describe the situation in detail..."
                    maxLength={500}
                    className={`${inputCls} resize-none`}/>
                  <p className="text-slate-500 text-[10px] mt-1 text-right">{desc.length}/500 characters</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>Priority</Label>
                    <div className="flex gap-2">
                      {['Normal','Urgent'].map(p => (
                        <button key={p} onClick={() => setPriority(p)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all"
                          style={{
                            borderColor: priority===p ? (p==='Urgent'?'#ef4444':'#3b82f6') : 'rgba(255,255,255,0.05)',
                            background:  priority===p ? (p==='Urgent'?'rgba(239,68,68,0.15)':'rgba(59,130,246,0.15)') : 'rgba(15,23,42,0.3)',
                            color:       priority===p ? (p==='Urgent'?'#ef4444':'#3b82f6') : '#64748b',
                          }}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label required>When did it happen?</Label>
                    <div className="relative">
                      <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)}
                        className={inputCls}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: People ───────────────────────────── */}
          {step === 3 && (
            <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md p-5 rounded-2xl mb-5">
              <p className="text-white font-bold text-sm mb-0.5">3. Number of People</p>
              <p className="text-slate-400 text-xs mb-4">How many people need help?</p>
              <div className="space-y-3">
                {[
                  { label:'Adults',   sub:'People aged 18 and above',   val:adults,   set:setAdults,   color:'#3b82f6' },
                  { label:'Children', sub:'People below the age of 18',  val:children, set:setChildren, color:'#10b981' },
                  { label:'Injured',  sub:'People needing medical help', val:injured,  set:setInjured,  color:'#ef4444' },
                ].map(({ label, sub, val, set, color }) => (
                  <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/50">
                    <div>
                      <p className="text-white text-sm font-bold">{label}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => set(Math.max(0, val-1))}
                        className="w-9 h-9 rounded-full border border-white/10 bg-slate-800 font-bold text-lg flex items-center justify-center hover:border-red-500 hover:text-red-500 text-white transition-colors">
                        −
                      </button>
                      <span className="text-white font-black text-xl w-6 text-center">{val}</span>
                      <button onClick={() => set(val+1)}
                        className="w-9 h-9 rounded-full border border-white/10 bg-slate-800 font-bold text-lg flex items-center justify-center hover:border-red-500 hover:text-red-500 text-white transition-colors">
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400 flex-shrink-0"/>
                <p className="text-blue-300 text-xs leading-relaxed">
                  Total: <strong>{adults + children} people</strong> need rescue, <strong>{injured}</strong> require immediate medical attention.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 4: Location ─────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4 mb-5">
              <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md p-5 rounded-2xl">
                <p className="text-white font-bold text-sm mb-0.5">4. Confirm Your Location</p>
                <p className="text-slate-400 text-xs mb-4">Help us find you faster</p>
                <div className={`p-4 rounded-xl border flex items-start gap-3 mb-4 ${
                  gpsState==='found' ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' :
                  gpsState==='locating' ? 'bg-amber-950/20 border-amber-900/30 text-amber-300' : 'bg-red-950/20 border-red-900/30 text-red-300'
                }`}>
                  <Navigation className={`w-5 h-5 mt-0.5 flex-shrink-0 ${gpsState==='found'?'text-emerald-500':gpsState==='locating'?'text-amber-500':'text-red-500'}`}/>
                  <div>
                    <p className={`text-sm font-bold ${gpsState==='found'?'text-emerald-300':gpsState==='locating'?'text-amber-300':'text-red-300'}`}>
                      {gpsState==='found' ? 'GPS Location Acquired' : gpsState==='locating' ? 'Acquiring GPS…' : 'GPS Unavailable'}
                    </p>
                    {gps && <p className="text-xs text-emerald-400 mt-0.5 font-mono">{gps.lat.toFixed(5)}, {gps.lng.toFixed(5)} · ±{gps.acc}m</p>}
                    {gpsState==='denied' && <p className="text-xs text-red-400 mt-0.5">Enable location permissions and try again.</p>}
                  </div>
                </div>
                <div>
                  <Label>Address / Landmark</Label>
                  <input value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="E.g., 12 Main Street, near City Hospital"
                    className={inputCls}/>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Review ───────────────────────────── */}
          {step === 5 && (
            <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md p-5 rounded-2xl mb-5">
              <p className="text-white font-bold text-sm mb-0.5">5. Review Your Report</p>
              <p className="text-slate-400 text-xs mb-4">Confirm the details before submitting</p>
              <div className="space-y-2.5">
                {[
                  { label:'Emergency Type', value: type || '—',          color:'#ef4444' },
                  { label:'Title',          value: title || '—',         color:'#3b82f6' },
                  { label:'Severity',       value: severity || '—',      color:'#f59e0b' },
                  { label:'Priority',       value: priority || '—',      color:'#8b5cf6' },
                  { label:'Description',    value: desc || 'Not provided',color:'#64748b' },
                  { label:'People',         value: `${adults} adults, ${children} children, ${injured} injured`, color:'#10b981' },
                  { label:'Location',       value: gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'GPS unavailable', color:'#f97316' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-slate-900/50">
                    <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background:color }}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wide font-semibold">{label}</p>
                      <p className="text-white text-sm font-semibold mt-0.5 capitalize">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {error && (
                <div className="mt-3 p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
                  <p className="text-red-400 text-sm font-semibold">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button onClick={() => step > 1 ? setStep(s => s-1) : navigate('/victim')}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-colors">
              {step > 1 ? '← Back' : 'Cancel'}
            </button>
            {step < 5 ? (
              <button onClick={() => setStep(s => s+1)}
                disabled={!canNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background:'#dc2626', boxShadow:'0 2px 10px rgba(220,38,38,.3)' }}>
                Next Step <ChevronRight className="w-4 h-4"/>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60"
                style={{ background:'#dc2626', boxShadow:'0 2px 10px rgba(220,38,38,.3)' }}>
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin"/> Submitting…</>
                  : <><Phone className="w-4 h-4"/> Send SOS Alert</>}
              </button>
            )}
          </div>
        </div>

        {/* ══ RIGHT: sticky panel ════════════════════════════ */}
        <div className="h-full overflow-y-auto scrollbar-none p-5 space-y-5 bg-[#0d1117]"
          style={{ borderLeft:'1px solid rgba(255,255,255,0.04)' }}>

          {/* Map */}
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <p className="text-white font-bold text-sm">
                {step === 4 ? '3. Your Location' : 'Your Location'}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">Confirm your current location</p>
            </div>
            {/* Map */}
            <div style={{ height:'180px' }} className="relative border-t border-b border-white/5">
              {gps ? (
                <MapContainer center={[gps.lat, gps.lng]} zoom={14}
                  style={{ height:'100%', width:'100%' }} zoomControl={true} attributionControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                  <CircleMarker center={[gps.lat, gps.lng]} radius={10}
                    pathOptions={{ fillColor:'#3b82f6', fillOpacity:1, color:'white', weight:3 }}/>
                </MapContainer>
              ) : (
                <div className="h-full bg-slate-900/50 flex items-center justify-center flex-col gap-2">
                  <Crosshair className="w-8 h-8 text-slate-500"/>
                  <p className="text-slate-400 text-xs">
                    {gpsState==='locating' ? 'Acquiring GPS…' : 'Location unavailable'}
                  </p>
                </div>
              )}
            </div>
            {/* Location info */}
            <div className="p-4 space-y-3">
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 text-white">
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">Current Location</p>
                <p className="text-slate-200 text-xs font-semibold">
                  {address || (gps ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : 'Acquiring…')}
                </p>
                {gps && (
                  <p className="text-slate-400 text-[10px] mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>
                    Accuracy ±{gps.acc}m · Last updated just now
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-blue-400 border border-blue-900/30 bg-blue-950/20 hover:bg-blue-900/20 transition-colors">
                  <Crosshair className="w-3.5 h-3.5"/> Use Current Location
                </button>
                <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-white/10 bg-slate-900/50 hover:bg-white/5 transition-colors">
                  <MapPin className="w-3.5 h-3.5"/> Enter Manually
                </button>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 shadow-md rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-white font-bold text-sm">What happens next?</p>
            </div>
            <div className="divide-y divide-white/5">
              {NEXT_STEPS.map(({ Icon: NIcon, label, desc, color }, i) => (
                <div key={label} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:`${color}12` }}>
                    <NIcon className="w-4.5 h-4.5" style={{ color }} size={18}/>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-bold">{label}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendSOS
