import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Clock, MapPin, Phone, MessageSquare,
  Shield, Truck, Ambulance, Navigation
} from 'lucide-react'
import { DUMMY } from '../../data/dummy'

const d = DUMMY.victim
const sd = DUMMY.dashboard.selectedIncident

/* ── Rescue timeline steps ──────────────────────────────────── */
const TIMELINE_STEPS = [
  { label: 'SOS Submitted',          time: `03:58 PM, ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`, status: 'done'    },
  { label: 'Message Stored Locally', time: `03:58 PM, ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`, status: 'done'    },
  { label: 'SOS Relayed via Mesh',   time: `03:58 PM, ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`, status: 'done'    },
  { label: 'AI Triage Completed',    time: `03:59 PM, ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`, status: 'done'    },
  { label: 'Rescue Team Notified',   time: `04:03 PM, ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`, status: 'done'    },
  { label: 'Team En-Route',          time: `04:05 PM, ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`, status: 'active'  },
  { label: 'Rescue Completed',       time: 'Pending',               status: 'pending' },
]

/* ── Timeline item ──────────────────────────────────────────── */
const TimelineItem = ({ label, time, status, isLast }) => {
  const isDone    = status === 'done'
  const isActive  = status === 'active'
  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
          style={{
            background: isDone ? 'rgba(16,185,129,0.15)' : isActive ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
            border: `2px solid ${isDone ? '#10b981' : isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: isActive ? '0 0 12px rgba(59,130,246,0.4)' : 'none',
          }}>
          {isDone
            ? <CheckCircle2 className="w-4 h-4" style={{ color: '#34d399' }} />
            : isActive
            ? <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#3b82f6' }} />
            : <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          }
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 my-1"
            style={{ background: isDone ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)', minHeight: 24 }} />
        )}
      </div>
      {/* Content */}
      <div className="flex-1 pb-4 pt-0.5">
        <p className="text-sm font-semibold leading-tight"
          style={{ color: isDone ? '#e2e8f0' : isActive ? '#60a5fa' : '#4b5563' }}>
          {label}
        </p>
        <p className="text-[10px] mt-0.5 font-mono"
          style={{ color: isDone ? '#374151' : isActive ? '#3b82f6' : '#1f2937' }}>
          {time}
        </p>
      </div>
    </div>
  )
}

export const RescueStatus = () => {
  const navigate = useNavigate()

  return (
    <div className="p-4 lg:p-6 animate-fade-in" style={{ background: '#0d1117', minHeight: '100%' }}>

      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#374151' }}>Dashboard</p>
        <h1 className="text-xl font-black text-white">Rescue Status</h1>
        <p className="text-sm mt-0.5" style={{ color: '#4b5563' }}>Track the progress of your rescue.</p>
      </div>

      {/* Incident info row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Incident ID',     value: `REQ-${new Date().getFullYear()}-0615-0897`, mono: true, color: '#e2e8f0' },
          { label: 'Emergency Type',  value: d.emergencyType, color: '#f97316' },
          { label: 'Priority',        value: d.priority, color: '#ef4444' },
          { label: 'Reported Time',   value: `09:28 PM, ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`, color: '#9ca3af' },
        ].map(({ label, value, mono, color }) => (
          <div key={label} className="rounded-xl p-3"
            style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[9px] uppercase tracking-wide mb-1" style={{ color: '#4b5563' }}>{label}</p>
            <p className={`text-xs font-bold ${mono ? 'font-mono text-[10px]' : ''}`} style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Left: Rescue Progress timeline */}
        <div className="lg:col-span-7 rounded-xl overflow-hidden"
          style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-white font-bold text-sm">Rescue Progress</p>
          </div>
          <div className="p-4">
            {TIMELINE_STEPS.map((step, i) => (
              <TimelineItem key={i} {...step} isLast={i === TIMELINE_STEPS.length - 1} />
            ))}
          </div>
        </div>

        {/* Right: Assigned Team + actions */}
        <div className="lg:col-span-5 space-y-3">

          {/* Assigned Team card */}
          <div className="rounded-xl overflow-hidden"
            style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white font-bold text-sm">Assigned Team</p>
            </div>
            <div className="p-4">
              {/* Team avatar + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(99,102,241,0.3))', border: '2px solid rgba(59,130,246,0.3)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <p className="text-white font-black text-base">Team Alpha-01</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold" style={{ color: '#34d399' }}>En Route to Location</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {[
                  { icon: Phone,     label: 'Team Contact', value: '+91 98765 43210', color: '#60a5fa' },
                  { icon: Truck,     label: 'Vehicle',       value: 'Ambulance',       color: '#e2e8f0' },
                  { icon: MapPin,    label: 'Distance',      value: `${d.distance} km`, color: '#f59e0b' },
                  { icon: Clock,     label: 'ETA',           value: `${d.eta} minutes`, color: '#f59e0b' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#4b5563' }} />
                    <span className="text-xs flex-shrink-0" style={{ color: '#6b7280', width: '84px' }}>{label}</span>
                    <span className="text-xs font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => navigate('/victim/location')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
              <Navigation className="w-4 h-4" />
              View Team on Map
            </button>
            <button
              onClick={() => navigate('/victim/chat')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)' }}>
              <MessageSquare className="w-4 h-4" />
              Chat with Team
            </button>
          </div>

          {/* Safety tip */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-[10px] uppercase tracking-wide font-bold mb-1" style={{ color: '#fbbf24' }}>Safety Tip</p>
            <p className="text-xs leading-relaxed" style={{ color: '#d97706' }}>
              Stay calm, move to a safe place if possible and keep your phone charged.
            </p>
            <button className="text-[10px] font-bold mt-1.5 flex items-center gap-1" style={{ color: '#f59e0b' }}>
              View Safety Guide <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

function ChevronRight({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export default RescueStatus
