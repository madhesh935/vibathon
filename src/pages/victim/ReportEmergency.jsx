import { useState, useEffect, useRef } from 'react'
import {
  Waves, Zap, Flame, Heart, Building2, UserX,
  MapPin, Mic, Camera, ImagePlus, AlertTriangle,
  Plus, Minus, ChevronRight, CheckCircle2,
  Radio, Loader2, Navigation
} from 'lucide-react'
import { DUMMY } from '../../data/dummy'

/* ── Emergency types ───────────────────────────────────────── */
const EMERGENCY_TYPES = [
  { id: 'flood',    label: 'Flood',            icon: Waves,     color: '#3b82f6', bg: 'rgba(59,130,246,0.15)'  },
  { id: 'earthquake', label: 'Earthquake',     icon: Zap,       color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  { id: 'fire',     label: 'Fire',             icon: Flame,     color: '#f97316', bg: 'rgba(249,115,22,0.15)'  },
  { id: 'medical',  label: 'Medical',          icon: Heart,     color: '#ef4444', bg: 'rgba(239,68,68,0.15)'   },
  { id: 'collapse', label: 'Building Collapse',icon: Building2, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)'  },
  { id: 'missing',  label: 'Missing Person',   icon: UserX,     color: '#a855f7', bg: 'rgba(168,85,247,0.15)'  },
]

/* ── Medical condition chips ────────────────────────────────── */
const CONDITIONS = ['Bleeding', 'Unconscious', 'Unable to move', 'Difficulty breathing', 'Other']

/* ── Status pill ────────────────────────────────────────────── */
const Pill = ({ label, active, onClick, color = '#ef4444' }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
    style={active
      ? { background: `${color}25`, color, border: `1px solid ${color}50` }
      : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    {label}
  </button>
)

/* ── Counter input ──────────────────────────────────────────── */
const Counter = ({ label, value, onChange, min = 0, max = 20 }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>{label}</span>
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Minus className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
      </button>
      <span className="w-7 text-center font-black text-white text-sm">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Plus className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
      </button>
    </div>
  </div>
)

/* ── Section wrapper ────────────────────────────────────────── */
const Section = ({ num, title, children }) => (
  <div className="rounded-xl overflow-hidden" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
        style={{ background: 'rgba(220,38,38,0.8)' }}>
        {num}
      </div>
      <p className="text-white font-bold text-sm">{title}</p>
    </div>
    <div className="p-4">{children}</div>
  </div>
)

export const ReportEmergency = () => {
  const [emergencyType, setEmergencyType] = useState('flood')
  const [description, setDescription]   = useState('')
  const [adults, setAdults]             = useState(2)
  const [children, setChildren]         = useState(0)
  const [elderly, setElderly]           = useState(0)
  const [conditions, setConditions]     = useState([])
  const [gps, setGps]                   = useState(null)
  const [gpsStatus, setGpsStatus]       = useState('locating')
  const [submitting, setSubmitting]     = useState(false)
  const [submitted, setSubmitted]       = useState(false)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => { setGps({ lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy) }); setGpsStatus('found') },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const toggleCondition = (c) => setConditions(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => { setSubmitting(false); setSubmitted(true) }, 2500)
  }

  const lat = gps?.lat ?? DUMMY.victim.coords.lat
  const lng = gps?.lng ?? DUMMY.victim.coords.lng
  const acc = gps?.acc ?? DUMMY.victim.coords.acc

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.5)' }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: '#ef4444' }} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Emergency Alert Sent!</h2>
        <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Your SOS has been broadcast through the ResQMesh network.</p>
        <p className="text-xs mb-6" style={{ color: '#374151' }}>A rescue team will be assigned shortly. Stay calm.</p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <a href="/victim/status" className="w-full py-3 rounded-xl font-bold text-sm text-white text-center transition-all"
            style={{ background: '#dc2626', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
            Track Your Rescue
          </a>
          <button onClick={() => setSubmitted(false)} className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>
            Submit Another Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-5 animate-fade-in" style={{ background: '#0d1117', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#374151' }}>Dashboard</p>
        <h1 className="text-xl font-black text-white">Report Emergency</h1>
        <p className="text-sm mt-0.5" style={{ color: '#4b5563' }}>Provide accurate information to help us respond faster.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">

        {/* Step 1: Emergency Type */}
        <Section num="1" title="Emergency Type">
          <div className="grid grid-cols-3 gap-2">
            {EMERGENCY_TYPES.map(({ id, label, icon: Icon, color, bg }) => {
              const isActive = emergencyType === id
              return (
                <button key={id} type="button" onClick={() => setEmergencyType(id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={{
                    background: isActive ? bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? color + '60' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: isActive ? `0 0 16px ${color}20` : 'none',
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: isActive ? bg : 'rgba(255,255,255,0.06)' }}>
                    <Icon className="w-5 h-5" style={{ color: isActive ? color : '#4b5563' }} />
                  </div>
                  <p className="text-[10px] font-bold text-center leading-tight"
                    style={{ color: isActive ? color : '#6b7280' }}>{label}</p>
                </button>
              )
            })}
          </div>
        </Section>

        {/* Step 2: Situation Description */}
        <Section num="2" title="Situation Description">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your situation in detail... (location details, what happened, immediate dangers)"
            rows={4}
            className="w-full text-sm rounded-xl px-3 py-2.5 resize-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              outline: 'none',
            }}
          />
          <div className="flex justify-end mt-1">
            <span className="text-[10px]" style={{ color: description.length > 200 ? '#ef4444' : '#374151' }}>
              {description.length}/250
            </span>
          </div>
        </Section>

        {/* Step 3: People Affected */}
        <Section num="3" title="People Affected">
          <div className="space-y-1">
            <Counter label="Adults"   value={adults}   onChange={setAdults}   />
            <Counter label="Children" value={children} onChange={setChildren} />
            <Counter label="Elderly"  value={elderly}  onChange={setElderly}  />
          </div>
          <div className="mt-3 pt-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs" style={{ color: '#6b7280' }}>
              Total: <strong className="text-white">{adults + children + elderly}</strong> people
            </span>
          </div>
        </Section>

        {/* Step 4: Medical Conditions */}
        <Section num="4" title="Medical Conditions">
          <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Select all that apply to people in your group.</p>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map(c => (
              <Pill key={c} label={c} active={conditions.includes(c)} onClick={() => toggleCondition(c)} />
            ))}
          </div>
          {conditions.length > 0 && (
            <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
              Selected: <span style={{ color: '#ef4444' }}>{conditions.join(', ')}</span>
            </p>
          )}
        </Section>

        {/* Step 5: Location */}
        <Section num="5" title="Location">
          <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
            style={{
              background: gpsStatus === 'found' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${gpsStatus === 'found' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
            }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: gpsStatus === 'found' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)' }}>
              <Navigation className="w-4 h-4" style={{ color: gpsStatus === 'found' ? '#34d399' : '#fbbf24' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: gpsStatus === 'found' ? '#34d399' : '#fbbf24' }}>
                {gpsStatus === 'found' ? 'Your location detected' : 'Detecting location...'}
              </p>
              {gpsStatus === 'found' && (
                <p className="text-xs font-mono mt-0.5" style={{ color: '#06b6d4' }}>
                  {lat.toFixed(4)}, {lng.toFixed(4)} · Accuracy ±{acc}m
                </p>
              )}
            </div>
            {gpsStatus !== 'found' && <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#fbbf24' }} />}
          </div>

          {/* Mini map placeholder */}
          <div className="relative h-28 rounded-xl overflow-hidden" style={{ background: '#1a2235' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-5 h-5 rounded-full" style={{ background: '#3b82f6', boxShadow: '0 0 0 8px rgba(59,130,246,0.2)' }} />
              </div>
            </div>
            <div className="absolute bottom-2 right-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.5)', color: '#06b6d4' }}>
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>
          </div>
        </Section>

        {/* Step 6: Add More (Optional) */}
        <Section num="6" title="Add More (Optional)">
          <p className="text-xs mb-3" style={{ color: '#6b7280' }}>Additional information helps rescue teams respond better.</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Mic, label: 'Voice Message', color: '#8b5cf6' },
              { icon: Camera, label: 'Add Photo', color: '#3b82f6' },
              { icon: ImagePlus, label: 'Upload Photos', color: '#10b981' },
            ].map(({ icon: Icon, label, color }) => (
              <button key={label} type="button"
                className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all hover:scale-105"
                style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold text-center">{label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Submit */}
        <div className="pt-2 pb-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !emergencyType}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-white text-base transition-all active:scale-[0.98] disabled:opacity-70"
            style={{
              background: submitting ? '#991b1b' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              boxShadow: '0 4px 24px rgba(220,38,38,0.4)',
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Broadcasting Emergency Alert...
              </>
            ) : (
              <>
                <Radio className="w-5 h-5" />
                Broadcast Emergency Alert
              </>
            )}
          </button>
          <p className="text-center text-xs mt-2" style={{ color: '#374151' }}>
            Your alert will be sent through the ResQMesh network.
          </p>
        </div>

      </div>
    </div>
  )
}

export default ReportEmergency
