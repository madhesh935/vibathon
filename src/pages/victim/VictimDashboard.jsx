import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Timer, MapPin, Users, Navigation,
  CheckCircle2, Clock, Phone, Share2, AlertTriangle,
  Ambulance, Truck, Activity, Radio, Droplets, Home, Tent, Package, Cross
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DUMMY } from '../../data/dummy'

const d = DUMMY.victim

/* ── Leaflet markers ─────────────────────────────────────── */
const mk = (color, size = 14, pulse = false) => L.divIcon({
  className: '',
  html: `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};border:2.5px solid rgba(255,255,255,0.9);
    box-shadow:0 0 0 4px ${color}44,0 2px 8px rgba(0,0,0,0.6);
    ${pulse ? `animation:leaflet-pulse 2s ease-out infinite` : ''}
  "></div>
  ${pulse ? `<style>@keyframes leaflet-pulse{0%{box-shadow:0 0 0 0 ${color}88}70%{box-shadow:0 0 0 12px transparent}100%{box-shadow:0 0 0 0 transparent}}</style>` : ''}`,
  iconSize: [size, size], iconAnchor: [size / 2, size / 2],
})
const victimIcon = mk('#3b82f6', 20, true)
const rescueIcon = mk('#ef4444', 16)
const safeIcon   = mk('#10b981', 11)

/* ── Components ─────────────────────────────────────────── */
const Panel = ({ title, action, children, icon: Icon, className = '' }) => (
  <div className={`rounded-xl overflow-hidden flex flex-col h-full bg-[#11141a] border border-white/5 ${className}`}>
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <p className="text-white font-bold text-xs tracking-wide">{title}</p>
      </div>
      {action && <div className="text-xs text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">{action}</div>}
    </div>
    <div className="p-4 flex-1 overflow-auto">
      {children}
    </div>
  </div>
)

const TIMELINE = [
  { label: 'Submitted', time: '09:29 PM', status: 'done' },
  { label: 'AI Assessment', time: '09:30 PM', status: 'done' },
  { label: 'Verified', time: '09:31 PM', status: 'done' },
  { label: 'Team Assigned', time: '09:32 PM', status: 'done' },
  { label: 'En Route', time: '09:35 PM', status: 'active' },
  { label: 'Arriving', time: '--:--', status: 'pending' },
  { label: 'Rescued', time: '--:--', status: 'pending' },
]

const LIVE_UPDATES = [
  { time: '09:38 PM', text: 'Rescue team dispatched', color: '#ef4444', icon: <Truck className="w-3 h-3 text-white" /> },
  { time: '09:35 PM', text: 'Team Alpha en route to your location', color: '#3b82f6', icon: <Navigation className="w-3 h-3 text-white" /> },
  { time: '09:31 PM', text: 'Your request is verified', color: '#10b981', icon: <CheckCircle2 className="w-3 h-3 text-white" /> },
  { time: '09:30 PM', text: 'Priority set to CRITICAL', color: '#f59e0b', icon: <AlertTriangle className="w-3 h-3 text-white" /> },
  { time: '09:29 PM', text: 'Emergency request submitted', color: '#8b5cf6', icon: <Shield className="w-3 h-3 text-white" /> },
]

const LIVE_FEED = [
  { time: '09:38 PM', text: 'Rescue team dispatched and en route', color: '#ef4444' },
  { time: '09:35 PM', text: 'Team Alpha is moving toward your location', color: '#3b82f6' },
  { time: '09:31 PM', text: 'Location verified successfully', color: '#10b981' },
  { time: '09:30 PM', text: 'Priority set to CRITICAL', color: '#f59e0b' },
  { time: '09:29 PM', text: 'Emergency request submitted', color: '#8b5cf6' },
]

const NEARBY = [
  { type: 'Shelters', count: 3, dist: '1.2 - 3.8 km', status: 'Open', color: '#10b981', icon: Home },
  { type: 'Hospitals', count: 4, dist: '1.2 - 6.7 km', status: 'Open', color: '#3b82f6', icon: Cross },
  { type: 'Relief Camps', count: 2, dist: '2.1 - 4.2 km', status: 'Active', color: '#a855f7', icon: Tent },
  { type: 'Food Centers', count: 5, dist: '1.3 - 5.2 km', status: 'Open', color: '#f59e0b', icon: Package },
  { type: 'Water Points', count: 6, dist: '0.8 - 3.3 km', status: 'Available', color: '#3b82f6', icon: Droplets },
]

const CONTACTS = [
  { label: 'Police', num: '100', color: '#3b82f6', icon: Shield },
  { label: 'Fire Dept.', num: '101', color: '#ef4444', icon: AlertTriangle },
  { label: 'Ambulance', num: '108', color: '#10b981', icon: Ambulance },
  { label: 'Disaster Helpline', num: '1078', color: '#a855f7', icon: Phone },
  { label: 'Relief Center', num: '1800-123-456', color: '#3b82f6', icon: Home },
  { label: 'Women Helpline', num: '1091', color: '#a855f7', icon: Users },
  { label: 'Child Helpline', num: '1098', color: '#ef4444', icon: Users },
  { label: 'Electricity', num: '1912', color: '#f59e0b', icon: Radio },
]

export const VictimDashboard = () => {
  const navigate = useNavigate()
  
  const mapRoute = [[d.coords.lat, d.coords.lng], [d.rescueCoords.lat, d.rescueCoords.lng]]

  return (
    <div className="h-full flex flex-col" style={{ background: '#05070a' }}>
      <div className="p-4 lg:p-5 flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">

        {/* ── ROW 1: Hero & Live Updates ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
          
          {/* HERO PANEL */}
          <div className="lg:col-span-8 rounded-xl relative overflow-hidden" 
               style={{ background: 'linear-gradient(135deg, rgba(20,10,10,1) 0%, rgba(25,15,15,1) 40%, rgba(10,12,18,1) 100%)', border: '1px solid rgba(239,68,68,0.1)' }}>
            {/* Red radial glow */}
            <div className="absolute top-0 left-[30%] w-[500px] h-[500px] pointer-events-none rounded-full blur-[100px] opacity-10 bg-red-600" style={{ transform: 'translate(-50%, -50%)' }} />
            
            <div className="p-6 relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              
              {/* Left Content */}
              <div>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Current Status</p>
                <h1 className="text-3xl font-black text-red-500 mb-1 leading-tight">
                  Rescue Team Alpha<br/>
                  <span className="text-white">Assigned</span>
                </h1>
                <p className="text-sm text-slate-300 mb-6">Team is on the way. Stay calm and stay safe.</p>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Shield className="w-3.5 h-3.5 text-red-500" />
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase leading-none">Priority</p>
                      <p className="text-[10px] font-bold text-red-500 leading-none mt-0.5">CRITICAL</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Timer className="w-3.5 h-3.5 text-amber-500" />
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase leading-none">ETA</p>
                      <p className="text-[10px] font-bold text-amber-500 leading-none mt-0.5">12 min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase leading-none">Distance</p>
                      <p className="text-[10px] font-bold text-blue-500 leading-none mt-0.5">2.4 km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase leading-none">Team</p>
                      <p className="text-[10px] font-bold text-emerald-500 leading-none mt-0.5">Alpha-01</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: Progress Circle */}
              <div className="flex justify-center shrink-0 mx-auto">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle cx="72" cy="72" r="64" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                    {/* Progress Circle */}
                    <circle cx="72" cy="72" r="64" stroke="url(#gradient)" strokeWidth="8" fill="none" strokeDasharray="402" strokeDashoffset="120" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Ambulance icon in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center border border-white/5">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[11px] font-bold text-white mb-1">Latest Update</p>
                  <p className="text-[10px] text-slate-400 mb-1">09:38 PM</p>
                  <p className="text-xs text-slate-300 leading-snug">Rescue team dispatched and en route to your location.</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white mb-1">Your Location</p>
                  <p className="text-[11px] text-blue-400 mb-1 font-mono">12.9711, 80.0404</p>
                  <button onClick={() => navigate('/victim/location')} className="text-[10px] text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1">
                    View on Map →
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* LIVE UPDATES */}
          <div className="lg:col-span-4">
            <Panel title="Live Updates" action="View All">
              <div className="space-y-4">
                {LIVE_UPDATES.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10" style={{ background: item.color }}>
                        {item.icon}
                      </div>
                      {i !== LIVE_UPDATES.length - 1 && <div className="w-px h-full bg-white/10 my-1" />}
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-400 font-mono">{item.time}</p>
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* ── ROW 2: Overview, Progress, Summary ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
          
          <Panel title="Emergency Overview" icon={AlertTriangle}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Request ID</span>
                <span className="text-xs font-mono text-white">REQ-{new Date().getFullYear()}-0615-0897</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Emergency Type</span>
                <span className="text-xs text-white">Flood</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Victims</span>
                <span className="text-xs text-white">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Reported Time</span>
                <span className="text-xs text-white">09:28 PM, {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Current Status</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">En Route</span>
              </div>
            </div>
          </Panel>

          <Panel title="Rescue Progress" icon={Activity}>
            <div className="flex justify-between items-center px-2 py-4 relative">
              {/* Connecting Line */}
              <div className="absolute top-7 left-6 right-6 h-0.5 bg-white/10" />
              <div className="absolute top-7 left-6 w-[55%] h-0.5 bg-emerald-500" />
              
              {TIMELINE.map((step, i) => {
                const isDone = step.status === 'done'
                const isActive = step.status === 'active'
                return (
                  <div key={i} className="flex flex-col items-center gap-2 relative z-10 w-12">
                    {isDone ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : isActive ? (
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0 border-2 border-[#11141a]">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-3 h-3 text-slate-500" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className={`text-[8px] whitespace-nowrap ${isActive ? 'text-red-500 font-bold' : isDone ? 'text-slate-300' : 'text-slate-500'}`}>{step.label}</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">{step.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel title="Response Summary" icon={Users}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 mt-0.5">Assigned Team</span>
                <span className="text-xs text-white font-semibold">Alpha-01</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 mt-0.5">Team Contact</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white font-mono">+91 98765 43210</span>
                  <Phone className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 mt-0.5">Resources Dispatched</span>
                <span className="text-xs text-white text-right w-32">Ambulance, Boat, 6 Rescuers</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 mt-0.5">Estimated Arrival</span>
                <span className="text-xs text-white">12 minutes</span>
              </div>
            </div>
          </Panel>

        </div>

        {/* ── ROW 3 & 4: Bottom Section ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0 flex-1 min-h-[300px]">
          
          {/* LEFT COL (8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Live Location Map */}
            <Panel title="Live Location" action={<span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Live</span>} className="flex-1">
              <div className="relative h-[200px] rounded-lg overflow-hidden border border-white/10 mb-3">
                <MapContainer center={[d.coords.lat, d.coords.lng]} zoom={13} style={{ height: '100%', width: '100%', background: '#0a0d14' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <Circle center={[d.coords.lat, d.coords.lng]} radius={300} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1, dashArray: '4 4' }} />
                  <Marker position={[d.coords.lat, d.coords.lng]} icon={victimIcon}>
                    <Popup><p className="font-bold text-blue-400">Your Location</p></Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">Current Coordinates</p>
                    <p className="text-xs font-mono text-white">12.9711, 80.0404</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">Location Accuracy</p>
                    <p className="text-xs text-white">± 5 m</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">Last Updated</p>
                    <p className="text-xs text-emerald-500 font-bold">Just now</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Share Location
                </button>
              </div>
            </Panel>

            {/* Nearby Resources */}
            <Panel title="Nearby Resources" action="View on Map" className="shrink-0">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {NEARBY.map((n, i) => (
                  <div key={i} className="flex-1 min-w-[140px] flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${n.color}20` }}>
                        <n.icon className="w-3.5 h-3.5" style={{ color: n.color }} />
                      </div>
                      <p className="text-xs font-bold text-white">{n.type}</p>
                    </div>
                    <p className="text-[10px] text-slate-300 mb-0.5">{n.count} Nearby</p>
                    <p className="text-[9px] text-slate-500 mb-2">{n.dist}</p>
                    <p className="text-[10px] font-bold" style={{ color: n.color }}>{n.status}</p>
                  </div>
                ))}
              </div>
            </Panel>

          </div>

          {/* RIGHT COL (4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Live Activity Feed */}
            <Panel title="Live Activity Feed" action="View All" className="flex-1">
              <div className="space-y-4">
                {LIVE_FEED.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: item.color }} />
                    <div className="flex gap-3 w-full">
                      <p className="text-[10px] text-slate-400 font-mono w-14 shrink-0 mt-0.5">{item.time}</p>
                      <p className="text-xs text-slate-200">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Emergency Contacts */}
            <Panel title="Emergency Contacts" action="View All" className="shrink-0">
              <div className="grid grid-cols-4 gap-2">
                {CONTACTS.map((c, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 border border-white/5 text-center cursor-pointer hover:bg-white/10 transition-colors">
                    <c.icon className="w-4 h-4 mb-1.5" style={{ color: c.color }} />
                    <p className="text-[9px] text-slate-300 leading-tight mb-1">{c.label}</p>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-white">
                      {c.num}
                      <Phone className="w-2.5 h-2.5" style={{ color: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

          </div>

        </div>

      </div>
    </div>
  )
}

export default VictimDashboard
