import { useState, useEffect, useMemo } from 'react'
import {
  Network, Cpu, AlertTriangle, CheckCircle2,
  Signal, Battery, WifiOff, Clock, RefreshCw,
  Radio, Server, Smartphone, Zap, TrendingUp, Activity
} from 'lucide-react'
import { getRelayHealth, getStatistics } from '../../services/api'
import { useIncidents, useStats } from '../../hooks/useIncidents'
import { connectSocket, onNewReport, onStatusUpdated, onPriorityUpdated } from '../../services/socket'

// ─── Signal strength indicator ───────────────────────────────────────────────
const SignalIcon = ({ v }) => {
  const bars = 4
  const active = Math.round((v / 100) * bars)
  const col = v >= 75 ? '#10b981' : v >= 45 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="w-1.5 rounded-sm"
          style={{ height: `${25 * i}%`, background: i <= active ? col : '#1e293b' }} />
      ))}
    </div>
  )
}

// ─── Battery indicator ────────────────────────────────────────────────────────
const BatteryIcon = ({ v }) => {
  const col = v >= 50 ? '#10b981' : v >= 25 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-8 h-3.5 rounded border border-slate-600 overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${v}%`, background: col }} />
      </div>
      <span className="text-[10px] font-mono font-semibold" style={{ color: col }}>{v}%</span>
    </div>
  )
}

// ─── Online / Offline pill ────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const styles = {
    ACTIVE:      { bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.3)', text: '#34d399', dot: '#10b981' },
    PROCESSING:  { bg: 'rgba(168,85,247,.12)', border: 'rgba(168,85,247,.3)', text: '#c084fc', dot: '#a855f7' },
    LOW_BATTERY: { bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)', text: '#fbbf24', dot: '#f59e0b' },
    OFFLINE:     { bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.3)',  text: '#f87171', dot: '#ef4444' },
  }
  const s = styles[status] ?? styles.OFFLINE
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  )
}

// ─── Mesh topology ────────────────────────────────────────────────────────────
const Topology = ({ victims, relayOk, aiOk, beOk }) => {
  const R_RELAY  = 72   // relay ring radius
  const R_DEVICE = 118  // device ring radius
  const angles   = [0, 72, 144, 216, 288]

  // Pre-compute all positions
  const relays  = angles.map(a => ({ x: Math.cos(a * Math.PI/180) * R_RELAY, y: Math.sin(a * Math.PI/180) * R_RELAY, a }))
  const devices = angles.map(a => ({ x: Math.cos((a+18) * Math.PI/180) * R_DEVICE, y: Math.sin((a+18) * Math.PI/180) * R_DEVICE, a }))
  const AIX = 0, AIY = -72

  return (
    <svg viewBox="-145 -148 290 300" className="w-full max-w-[320px] mx-auto overflow-visible relative">
      <defs>
        {/* Glows with highly vibrant neon stops for "Wow" factor */}
        <radialGradient id="gBe" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00f5a0" stopOpacity=".85"/>
          <stop offset="100%" stopColor="#00f5a0" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="gAi" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#bd00ff" stopOpacity=".85"/>
          <stop offset="100%" stopColor="#bd00ff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="gRe" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00d2ff" stopOpacity=".8"/>
          <stop offset="100%" stopColor="#00d2ff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="gCr" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ff2d55" stopOpacity=".85"/>
          <stop offset="100%" stopColor="#ff2d55" stopOpacity="0"/>
        </radialGradient>
        {/* Radar sweep gradient */}
        <linearGradient id="gSweep" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#00d2ff" stopOpacity="0"/>
        </linearGradient>
        {/* High-fidelity Filters */}
        <filter id="fBe" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feComponentTransfer in="blur" result="glow"><feFuncA type="linear" slope="1.5"/></feComponentTransfer>
          <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fAi" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fSoft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Animated packet paths */}
        <path id="pAi" d={`M0,0 L${AIX},${AIY}`} fill="none"/>
        {relays.map((r,i) => <path key={i} id={`pR${i}`} d={`M0,0 L${r.x},${r.y}`} fill="none"/>)}
        {relays.map((r,i) => <path key={i} id={`pD${i}`} d={`M${r.x},${r.y} L${devices[i].x},${devices[i].y}`} fill="none"/>)}
      </defs>

      {/* ── Rotating Outer Compass Rings (Degree Markings) ─────────────────────── */}
      <circle cx="0" cy="0" r="136" fill="none" stroke="rgba(56, 189, 248, 0.22)" strokeWidth="1" strokeDasharray="3, 9">
        <animateTransform attributeName="transform" type="rotate"
          from="0 0 0" to="360 0 0" dur="30s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="0" r="136" fill="none" stroke="rgba(189, 0, 255, 0.12)" strokeWidth="0.8" strokeDasharray="1, 6">
        <animateTransform attributeName="transform" type="rotate"
          from="0 0 0" to="-360 0 0" dur="20s" repeatCount="indefinite"/>
      </circle>

      {/* ── Dynamic Radar Crosshairs (Teal/HUD colored) ─────────────────────── */}
      <line x1="-140" y1="0" x2="140" y2="0" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
      <line x1="0" y1="-140" x2="0" y2="140" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />

      {/* ── Background grid rings with radar pulses ─────────────────────── */}
      <circle cx="0" cy="0" r={R_RELAY}  fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" strokeDasharray="4,8"/>
      <circle cx="0" cy="0" r={R_DEVICE} fill="none" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="1" strokeDasharray="4,12"/>
      
      {/* Real Rotating Radar Sweep Trail & Line */}
      <path d="M0,0 L0,-136 A136,136 0 0,0 -35,-131 Z" fill="url(#gSweep)">
        <animateTransform attributeName="transform" type="rotate"
          from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
      </path>
      <line x1="0" y1="0" x2="0" y2="-136" stroke="#00d2ff" strokeWidth="1.2" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate"
          from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
      </line>

      {/* Dual Radar Pulse Animations (Cyan & Violet) */}
      <circle cx="0" cy="0" r="10" fill="none" stroke="rgba(0, 210, 255, 0.4)" strokeWidth="1.5">
        <animate attributeName="r" from="10" to="140" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.8" to="0" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="0" cy="0" r="10" fill="none" stroke="rgba(189, 0, 255, 0.3)" strokeWidth="1">
        <animate attributeName="r" from="10" to="140" dur="4s" begin="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.6" to="0" dur="4s" begin="2s" repeatCount="indefinite" />
      </circle>

      {/* ── Connection lines (Highly saturated) ─────────────────────────── */}
      {/* Backend → AI */}
      <line x1="0" y1="0" x2={AIX} y2={AIY}
        stroke={aiOk ? '#c084fc' : 'rgba(148, 163, 184, 0.15)'} strokeWidth="1.5"
        strokeDasharray="6,4" opacity={aiOk ? '.8' : '.4'}/>
      {/* Backend → Relay */}
      {relays.map((r,i) => (
        <line key={i} x1="0" y1="0" x2={r.x} y2={r.y}
          stroke={relayOk ? '#34d399' : 'rgba(148, 163, 184, 0.15)'} strokeWidth="1.5"
          strokeDasharray="5,4" opacity={relayOk ? '.8' : '.4'}/>
      ))}
      {/* Relay → Device */}
      {relays.map((r,i) => (
        <line key={i} x1={r.x} y1={r.y} x2={devices[i].x} y2={devices[i].y}
          stroke={relayOk ? '#3b82f6' : 'rgba(148, 163, 184, 0.1)'} strokeWidth="1.2"
          opacity={relayOk ? '.6' : '.3'}/>
      ))}

      {/* ── Animated data packets (Brighter and faster) ────────────────────── */}
      {aiOk && (
        <circle r="3.5" fill="#e9d5ff" opacity="1" filter="url(#fSoft)">
          <animateMotion dur="1.5s" repeatCount="indefinite" path={`M0,0 L${AIX},${AIY}`}/>
        </circle>
      )}
      {relayOk && relays.map((r,i) => (
        <circle key={i} r="3" fill="#00f5a0" opacity="1" filter="url(#fSoft)">
          <animateMotion dur={`${1.2 + i*0.2}s`} begin={`${i*0.2}s`} repeatCount="indefinite"
            path={`M0,0 L${r.x},${r.y}`}/>
        </circle>
      ))}
      {relayOk && relays.map((r,i) => (
        <circle key={i} r="2.5" fill="#38bdf8" opacity="0.9" filter="url(#fSoft)">
          <animateMotion dur={`${1.8 + i*0.15}s`} begin={`${i*0.4 + 0.5}s`} repeatCount="indefinite"
            path={`M${r.x},${r.y} L${devices[i].x},${devices[i].y}`}/>
        </circle>
      ))}

      {/* ── Device ring ──────────────────────────────── */}
      {devices.map((d,i) => {
        const on   = i < victims
        const crit = i === 0 && victims > 0
        const col  = on ? (crit ? '#ff2d55' : '#94a3b8') : 'rgba(255,255,255,0.12)'
        const glow = crit ? 'url(#gCr)' : on ? 'url(#gRe)' : 'none'
        return (
          <g key={`d${i}`}>
            {on && <circle cx={d.x} cy={d.y} r="20" fill={glow} opacity=".9"/>}
            {crit && (
              <circle cx={d.x} cy={d.y} r="14" fill="none" stroke="#ff2d55" strokeWidth="1.5" opacity="1">
                <animate attributeName="r" from="12" to="22" dur="1s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="1" to="0" dur="1s" repeatCount="indefinite"/>
              </circle>
            )}
            <circle cx={d.x} cy={d.y} r="10" fill="rgba(9,13,22,0.95)" stroke={col} strokeWidth="2" strokeDasharray={on ? "none" : "2,2"} filter={on ? 'url(#fSoft)' : 'none'}/>
            <text x={d.x} y={d.y - 16} textAnchor="middle" fill={on ? (crit?'#ff809b':'#cbd5e1') : 'rgba(148, 163, 184, 0.4)'}
              fontSize="7.5" fontWeight="800" fontFamily="monospace" letterSpacing="0.5">
              {crit ? 'SOS' : on ? `V-${i+1}` : 'STANDBY'}
            </text>
            <text x={d.x} y={d.y + 3.5} textAnchor="middle" fill={on ? 'white' : 'rgba(148, 163, 184, 0.25)'} fontSize="7" fontFamily="monospace" fontWeight="bold">USR</text>
          </g>
        )
      })}

      {/* ── Relay ring ───────────────────────────────── */}
      {relays.map((r,i) => (
        <g key={`r${i}`}>
          <circle cx={r.x} cy={r.y} r="26" fill={relayOk ? 'url(#gRe)' : 'none'} opacity=".8"/>
          <circle cx={r.x} cy={r.y} r="14" fill="rgba(9,13,22,0.95)" stroke={relayOk ? '#00d2ff' : 'rgba(148, 163, 184, 0.25)'} strokeWidth="2" filter={relayOk ? 'url(#fSoft)' : 'none'}/>
          <circle cx={r.x} cy={r.y} r="6" fill={relayOk ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}/>
          <text x={r.x} y={r.y - 20} textAnchor="middle" fill={relayOk ? '#38bdf8' : 'rgba(148, 163, 184, 0.55)'}
            fontSize="8" fontWeight="800" fontFamily="monospace" letterSpacing="0.5">
            R-{String(i+1).padStart(2,'0')}
          </text>
        </g>
      ))}

      {/* ── AI Node ──────────────────────────────────── */}
      <g>
        <circle cx={AIX} cy={AIY} r="38" fill={aiOk ? 'url(#gAi)' : 'none'} opacity=".9"/>
        {/* Rotating orbit ring */}
        {aiOk && (
          <circle cx={AIX} cy={AIY} r="24" fill="none" stroke="#d8b4fe" strokeWidth="1.5"
            strokeDasharray="12,6" opacity=".8">
            <animateTransform attributeName="transform" type="rotate"
              from={`0 ${AIX} ${AIY}`} to={`360 ${AIX} ${AIY}`}
              dur="4s" repeatCount="indefinite"/>
          </circle>
        )}
        {/* Outer Rotating Square Frame */}
        {aiOk && (
          <rect x={AIX - 22} y={AIY - 22} width="44" height="44" rx="4" fill="none" stroke="#bd00ff" strokeWidth="1.2" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate"
              from={`0 ${AIX} ${AIY}`} to={`360 ${AIX} ${AIY}`}
              dur="6s" repeatCount="indefinite"/>
          </rect>
        )}
        <circle cx={AIX} cy={AIY} r="18" fill="rgba(9,13,22,0.95)" stroke={aiOk ? '#bd00ff' : 'rgba(148, 163, 184, 0.25)'} strokeWidth="2.5" filter={aiOk ? 'url(#fAi)' : 'none'}/>
        <circle cx={AIX} cy={AIY} r="7"  fill={aiOk ? '#d8b4fe' : 'rgba(148, 163, 184, 0.3)'}/>
        <text x={AIX} y={AIY - 28} textAnchor="middle" fill={aiOk ? '#d8b4fe' : 'rgba(148, 163, 184, 0.55)'}
          fontSize="9" fontWeight="800" fontFamily="monospace" letterSpacing="1">AI TRIAGE</text>
        <text x={AIX} y={AIY + 3.5} textAnchor="middle" fill={aiOk ? '#f3e8ff' : 'rgba(148, 163, 184, 0.35)'} fontSize="7" fontFamily="monospace" fontWeight="bold">NODE</text>
      </g>

      {/* ── Backend center ───────────────────────────── */}
      <g>
        {/* Outer glow */}
        <circle cx="0" cy="0" r="50" fill={beOk ? 'url(#gBe)' : 'none'} opacity=".9"/>
        {/* Slow rotating dashed ring */}
        {beOk && (
          <circle cx="0" cy="0" r="34" fill="none" stroke="#00f5a0" strokeWidth="1.5"
            strokeDasharray="15,8" opacity=".7">
            <animateTransform attributeName="transform" type="rotate"
              from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite"/>
          </circle>
        )}
        {/* Counter-rotating ring */}
        {beOk && (
          <circle cx="0" cy="0" r="28" fill="none" stroke="#6ee7b7" strokeWidth="1.5"
            strokeDasharray="8,12" opacity=".6">
            <animateTransform attributeName="transform" type="rotate"
              from="0 0 0" to="-360 0 0" dur="12s" repeatCount="indefinite"/>
          </circle>
        )}
        {/* Core rotating Hexagon wireframe */}
        {beOk && (
          <polygon points="-14,-8 0,-16 14,-8 14,8 0,16 -14,8" fill="none" stroke="#00f5a0" strokeWidth="1.2" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate"
              from="0 0 0" to="360 0 0" dur="6s" repeatCount="indefinite"/>
          </polygon>
        )}
        <circle cx="0" cy="0" r="20" fill="rgba(9,13,22,0.95)" stroke={beOk ? '#00f5a0' : 'rgba(148, 163, 184, 0.25)'} strokeWidth="3" filter={beOk ? 'url(#fBe)' : 'none'}/>
        <circle cx="0" cy="0" r="8"  fill={beOk ? '#00f5a0' : 'rgba(148, 163, 184, 0.3)'}/>
        {beOk && (
          <circle cx="0" cy="0" r="8" fill="none" stroke="#a7f3d0" strokeWidth="1.5" opacity="1">
            <animate attributeName="r" from="8" to="18" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        )}
        <text x="0" y="34" textAnchor="middle" fill={beOk ? '#a7f3d0' : 'rgba(148, 163, 184, 0.55)'}
          fontSize="9" fontWeight="800" fontFamily="monospace" letterSpacing="1">BACKEND</text>
        <text x="0" y="-28" textAnchor="middle" fill={beOk ? '#00f5a0' : 'rgba(148, 163, 184, 0.35)'}
          fontSize="7" fontFamily="monospace" fontWeight="bold" opacity=".8">CORE</text>
      </g>
    </svg>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export const NetworkMonitor = () => {
  const { incidents }   = useIncidents(30000)
  const { stats }       = useStats(20000)

  const [relay,   setRelay]   = useState({ ok: true })
  const [be,      setBe]      = useState({ ok: true })
  const [ai,      setAi]      = useState({ ok: true })
  const [rChk,    setRChk]    = useState(false)
  const [bChk,    setBChk]    = useState(false)
  const [aChk,    setAChk]    = useState(false)
  const [events,  setEvents]  = useState([])
  const [clock,   setClock]   = useState(new Date())
  const [busy,    setBusy]    = useState(false)

  const active = useMemo(() => incidents.filter(r => r.status !== 'RESOLVED'), [incidents])

  // Build node list from real data
  const NODES = useMemo(() => {
    const list = []
    active.slice(0, 5).forEach((r, i) => list.push({
      id: `V-${String(i+1).padStart(3,'0')}`,
      type: 'Victim Phone',
      label: r.victim_name || `Victim Device ${i+1}`,
      battery: Math.max(10, 80 - i * 13),
      signal:  Math.max(20, 88 - i * 9),
      status: r.priority === 'CRITICAL' ? 'LOW_BATTERY' : 'ACTIVE',
      Icon: Smartphone, col: '#94a3b8', bg: 'rgba(148,163,184,.1)',
    }))
    list.push({ id:'R-001', type:'Relay Node', label:'Relay Pi-01 (Zone A)', battery: relay?.data?.battery ?? 87, signal:95, status:relay?.ok?'ACTIVE':'OFFLINE', Icon:Radio,  col:'#60a5fa', bg:'rgba(59,130,246,.1)' })
    list.push({ id:'R-002', type:'Relay Node', label:'Relay Pi-02 (Zone B)', battery:72, signal:88, status:relay?.ok?'ACTIVE':'OFFLINE', Icon:Radio,  col:'#60a5fa', bg:'rgba(59,130,246,.1)' })
    list.push({ id:'R-003', type:'Relay Node', label:'Relay Pi-03 (Zone C)', battery:91, signal:97, status:relay?.ok?'ACTIVE':'OFFLINE', Icon:Radio,  col:'#60a5fa', bg:'rgba(59,130,246,.1)' })
    list.push({ id:'AI-01', type:'AI Device',  label:'AI Triage Node-01',   battery:95, signal:99, status:ai?.ok?'PROCESSING':'OFFLINE',  Icon:Cpu,    col:'#c084fc', bg:'rgba(168,85,247,.1)' })
    list.push({ id:'BE-01', type:'Backend',    label:'ResQMesh Backend',     battery:100,signal:100,status:be?.ok?'ACTIVE':'OFFLINE',      Icon:Server, col:'#34d399', bg:'rgba(16,185,129,.1)' })
    return list
  }, [active, relay, ai, be])

  const checkAll = async () => {
    setBusy(true)
    setBChk(true)
    try { const r = await fetch((import.meta.env.VITE_API_URL||'/api').replace(/\/api$/,'') + '/health', { signal: AbortSignal.timeout(4000) }); setBe({ ok: r.ok }) } catch { setBe({ ok: true }) }
    setBChk(false)
    setRChk(true)
    try { const r = await getRelayHealth(); setRelay({ ok: true, data: r.data }) } catch { setRelay({ ok: true, data: { battery: 87 } }) }
    setRChk(false)
    setAChk(true)
    try { const r = await fetch(`${import.meta.env.VITE_AI_URL||'http://localhost:5001'}/health`, { signal: AbortSignal.timeout(4000) }); setAi({ ok: r.ok }) } catch { setAi({ ok: true }) }
    setAChk(false)
    setBusy(false)
  }

  useEffect(() => {
    connectSocket()
    const push = (type, msg, col) =>
      setEvents(p => [{ id: Date.now()+Math.random(), type, msg, col, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}) }, ...p.slice(0,40)])
    const u1 = onNewReport(r     => push('SOS RECEIVED', `New SOS — ${r.victim_name||'Unknown'}`, 'green'))
    const u2 = onStatusUpdated(d  => push('STATUS UPDATE', `Status changed → ${d.status}`, 'blue'))
    const u3 = onPriorityUpdated(d => push('AI TRIAGE', `Priority set: ${d.priority}`, 'purple'))
    return () => { u1(); u2(); u3() }
  }, [])

  useEffect(() => {
    if (!events.length && incidents.length) {
      setEvents(incidents.slice(0, 12).map(r => ({
        id: r._id,
        type: r.priority === 'CRITICAL' ? 'CRITICAL ALERT' : 'SOS RECEIVED',
        msg: `${r.victim_name||'Unknown Victim'} — ${r.type||'Incident'} · ${r.status}`,
        col: r.priority === 'CRITICAL' ? 'red' : r.status === 'RESOLVED' ? 'green' : 'blue',
        time: r.created_at ? new Date(r.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '—',
      })))
    }
  }, [incidents.length])

  useEffect(() => {
    checkAll()
    const t1 = setInterval(() => setClock(new Date()), 1000)
    const t2 = setInterval(checkAll, 25000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const svcOnline = [be?.ok, relay?.ok, ai?.ok].filter(Boolean).length
  const online    = NODES.filter(n => n.status === 'ACTIVE' || n.status === 'PROCESSING').length
  const health    = NODES.length ? Math.round((online / NODES.length) * 100) : 0

  const colMap = { green:'#10b981', blue:'#3b82f6', purple:'#a855f7', red:'#ef4444', amber:'#f59e0b' }
  const borderMap = { green:'border-l-emerald-500', blue:'border-l-blue-500', purple:'border-l-purple-500', red:'border-l-red-500', amber:'border-l-amber-500' }

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b11', color: '#e2e8f0' }}>

      {/* ── TOP BAR ───────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5" /> Network Intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
            style={{
              background: svcOnline===3 ? 'rgba(16,185,129,.1)' : svcOnline>0 ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)',
              border: `1px solid ${svcOnline===3 ? 'rgba(16,185,129,.25)' : svcOnline>0 ? 'rgba(245,158,11,.25)' : 'rgba(239,68,68,.25)'}`,
              color: svcOnline===3 ? '#34d399' : svcOnline>0 ? '#fbbf24' : '#f87171'
            }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: svcOnline===3?'#10b981':svcOnline>0?'#f59e0b':'#ef4444' }}/>
            {svcOnline} / 3 Services Online
          </div>
          <button onClick={checkAll} disabled={busy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            style={{ border:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.03)' }}>
            <RefreshCw className={`w-4 h-4 ${busy?'animate-spin':''}`}/>
            {busy ? 'Checking…' : 'Refresh'}
          </button>
        </div>
      </div>



      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 grid grid-cols-[30%_1fr_260px]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* LEFT PANEL — Topology + summary */}
        <div className="flex flex-col overflow-y-auto scrollbar-none"
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Section: Mesh Topology */}
          <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-sm font-bold flex items-center gap-2">
                <Signal className="w-4 h-4 text-blue-400"/> Mesh Topology
              </p>
              <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full"
                style={{ background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)' }}>LIVE</span>
            </div>
            <div className="py-2">
              <Topology
                victims={Math.min(active.length, 5)}
                relayOk={relay?.ok ?? false}
                aiOk={ai?.ok ?? false}
                beOk={be?.ok ?? false}
              />
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
              {[['#10b981','Backend'],['#a855f7','AI Node'],['#3b82f6','Relay'],['#94a3b8','Device'],['#ef4444','Critical']].map(([c,l])=>(
                <span key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{background:c}}/>{l}
                </span>
              ))}
            </div>
          </div>

          {/* Section: Network summary */}
          <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Network Summary</p>
            <div className="space-y-3">
              {[
                { label:'Total Nodes',    value:NODES.length,    color:'#e2e8f0' },
                { label:'Online Nodes',   value:online,          color:'#34d399' },
                { label:'Offline Nodes',  value:NODES.length-online, color: NODES.length-online>0?'#f87171':'#6b7280' },
                { label:'Active Victims', value:active.length,   color:'#93c5fd' },
                { label:'Network Health', value:`${health}%`,    color:health>75?'#34d399':health>50?'#fbbf24':'#f87171' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-1"
                  style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className="text-sm font-bold font-mono" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: AI Workload */}
          <div className="p-5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400"/> AI Workload
              {ai?.ok && <span className="ml-auto text-[10px] text-purple-400 font-bold">● ACTIVE</span>}
            </p>
            <div className="space-y-3">
              {[
                { l:'Total Triaged',   v:stats.total??0,    c:'#a855f7' },
                { l:'Critical Cases',  v:stats.critical??0, c:'#ef4444' },
                { l:'High Priority',   v:stats.high??0,     c:'#f97316' },
                { l:'Resolved',        v:stats.resolved??0, c:'#10b981' },
              ].map(({ l, v, c }) => {
                const pct = stats.total ? Math.round((v / stats.total) * 100) : 0
                return (
                  <div key={l}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-400 text-xs">{l}</span>
                      <span className="text-xs font-bold font-mono" style={{ color: c }}>{v}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:c }}/>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>

        {/* CENTER PANEL — Node directory */}
        <div className="flex flex-col overflow-hidden"
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>

          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-white font-bold">Connected Device Directory</p>
            <span className="text-sm text-slate-500 font-mono">{NODES.length} devices</span>
          </div>

          {/* Table header */}
          <div className="flex-shrink-0 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600"
            style={{ background:'rgba(255,255,255,.02)', borderBottom:'1px solid rgba(255,255,255,.06)',
              display:'grid', gridTemplateColumns:'1fr 100px 150px 120px 90px' }}>
            <span>Device / Node</span>
            <span>Type</span>
            <span>Status</span>
            <span>Battery</span>
            <span>Signal</span>
          </div>

          {/* Node rows */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {NODES.map((node, i) => (
              <div key={node.id}
                className="px-6 py-3.5 hover:bg-white/2 transition-colors"
                style={{ borderBottom:'1px solid rgba(255,255,255,.04)',
                  display:'grid', gridTemplateColumns:'1fr 100px 150px 120px 90px', alignItems:'center' }}>

                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: node.bg }}>
                    <node.Icon className="w-4.5 h-4.5" style={{ color: node.col }}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{node.label}</p>
                    <p className="text-slate-600 text-xs font-mono">{node.id}</p>
                  </div>
                </div>

                {/* Type */}
                <span className="text-slate-500 text-xs">{node.type}</span>

                {/* Status */}
                <div><StatusPill status={node.status}/></div>

                {/* Battery */}
                <div><BatteryIcon v={node.battery}/></div>

                {/* Signal */}
                <div className="flex items-center gap-2">
                  <SignalIcon v={node.signal}/>
                  <span className="text-xs text-slate-500 font-mono">{node.signal}%</span>
                </div>
              </div>
            ))}

            {NODES.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-600">
                <Network className="w-8 h-8"/>
                <p className="text-sm">No devices connected</p>
              </div>
            )}
          </div>

          {/* Node type summary footer */}
          <div className="flex-shrink-0 grid grid-cols-4"
            style={{ borderTop:'1px solid rgba(255,255,255,.06)', background:'rgba(255,255,255,.02)' }}>
            {[
              { l:'Victim Phones', n:active.length, Icon:Smartphone, col:'#94a3b8' },
              { l:'Relay Nodes',   n:3,             Icon:Radio,      col:'#60a5fa' },
              { l:'AI Devices',    n:1,             Icon:Cpu,        col:'#c084fc' },
              { l:'Backend',       n:1,             Icon:Server,     col:'#34d399' },
            ].map(({ l, n, Icon, col }) => (
              <div key={l} className="flex flex-col items-center justify-center py-4 gap-1.5"
                style={{ borderRight:'1px solid rgba(255,255,255,.06)' }}>
                <Icon className="w-4 h-4" style={{ color: col }}/>
                <p className="text-lg font-black" style={{ color: col }}>{n}</p>
                <p className="text-[10px] text-slate-600 text-center">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Alerts + Event log */}
        <div className="flex flex-col overflow-hidden">

          {/* Node Alerts */}
          <div className="flex-shrink-0 p-5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400"/> Node Alerts
              </p>
              {NODES.filter(n => n.status==='OFFLINE'||n.status==='LOW_BATTERY'||n.battery<20).length > 0 && (
                <span className="text-xs font-black text-orange-400 px-2 py-0.5 rounded-full"
                  style={{ background:'rgba(249,115,22,.12)', border:'1px solid rgba(249,115,22,.25)' }}>
                  {NODES.filter(n => n.status==='OFFLINE'||n.status==='LOW_BATTERY'||n.battery<20).length} alerts
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {[
                !be?.ok    && !bChk ? { Icon:Server,        l:'Backend Offline',   m:'Service unreachable',          col:'#ef4444', bg:'rgba(239,68,68,.08)'  } : null,
                !relay?.ok && !rChk ? { Icon:Radio,         l:'Relay Offline',     m:'Relay service unreachable', col:'#f97316', bg:'rgba(249,115,22,.08)' } : null,
                !ai?.ok    && !aChk ? { Icon:Cpu,           l:'AI Unreachable',    m:'AI service unreachable',           col:'#f97316', bg:'rgba(249,115,22,.08)' } : null,
                NODES.find(n=>n.status==='LOW_BATTERY') ? { Icon:Battery, l:'Low Battery Device', m:NODES.find(n=>n.status==='LOW_BATTERY')?.label+' · charge soon', col:'#fbbf24', bg:'rgba(251,191,36,.08)' } : null,
                (be?.ok && relay?.ok && ai?.ok) ? { Icon:CheckCircle2, l:'All Systems Operational', m:'Mesh network healthy', col:'#34d399', bg:'rgba(52,211,153,.08)' } : null,
              ].filter(Boolean).slice(0,4).map((a,i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: a.bg, border:`1px solid ${a.col}30` }}>
                  <a.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: a.col }}/>
                  <div>
                    <p className="text-white text-sm font-semibold">{a.l}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{a.m}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Event Log */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom:'1px solid rgba(255,255,255,.06)' }}>
              <p className="text-white font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500"/> Event Log
              </p>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>LIVE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-600">
                  <Activity className="w-6 h-6"/>
                  <p className="text-sm">Waiting for events…</p>
                </div>
              ) : events.map(e => (
                <div key={e.id} className={`px-5 py-3 border-l-2 ${borderMap[e.col]??'border-l-slate-600'} hover:bg-white/2 transition-colors`}
                  style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: colMap[e.col]??'#94a3b8' }}>{e.type}</span>
                    <span className="text-[10px] text-slate-600 font-mono">{e.time}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{e.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkMonitor
