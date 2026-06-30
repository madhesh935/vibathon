import { useState } from 'react'
import {
  Users, Navigation, Clock, MapPin, Radio, Shield, Map as MapIcon, Phone,
  User, AlertTriangle, Crosshair, Activity, Radar, Battery, Signal, Zap, HeartPulse, Ambulance
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const TEAMS = [
  { 
    id: 'T1', name: 'Alpha Strike Rescue', status: 'En Route', eta: '12 min', 
    color: '#10b981', members: 6, vehicle: 'Amphibious Carrier', 
    task: 'Flood Evac - Sector 4', state: 'Moving', update: '12s ago', 
    lat: 12.9711, lng: 80.0404, health: 98, fuel: 85, signal: 'Strong',
    equipment: ['Rafts x2', 'Trauma Kit', 'Life Vests x20']
  },
  { 
    id: 'T2', name: 'Bravo Air Support', status: 'On Scene', eta: '--', 
    color: '#3b82f6', members: 3, vehicle: 'Recon Helicopter', 
    task: 'Aerial Search', state: 'Working', update: '45s ago', 
    lat: 13.0820, lng: 80.2200, health: 100, fuel: 45, signal: 'Medium',
    equipment: ['Thermal Cam', 'Rescue Hoist', 'Searchlight']
  },
  { 
    id: 'T3', name: 'Charlie Medical', status: 'Returning', eta: '15 min', 
    color: '#f59e0b', members: 5, vehicle: 'Mobile ICU Van', 
    task: 'Triage Transport', state: 'In Transit', update: '2m ago', 
    lat: 13.0400, lng: 80.2600, health: 90, fuel: 60, signal: 'Weak',
    equipment: ['Defibrillator', 'O2 Tanks', 'Stretchers x4']
  },
  { 
    id: 'T4', name: 'Delta Engineering', status: 'Standby', eta: '--', 
    color: '#94a3b8', members: 8, vehicle: 'Heavy Clearance', 
    task: 'Debris Removal', state: 'Available', update: '10m ago', 
    lat: 13.0600, lng: 80.2430, health: 100, fuel: 100, signal: 'Strong',
    equipment: ['Chainsaws', 'Hydraulic Jacks', 'Floodlights']
  },
]

const routePositions = [
  [13.0600, 80.2430],
  [12.9711, 80.0404],
]

const startIcon = L.divIcon({
  className: '',
  html: `<div style="width:12px;height:12px;background:#3b82f6;border-radius:50%;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 10px rgba(59,130,246,0.8);"></div>`,
  iconSize: [12,12], iconAnchor: [6,6]
})
const endIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 15px rgba(239,68,68,1); animation: pulse 2s infinite;"></div>`,
  iconSize: [14,14], iconAnchor: [7,7]
})

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

export const RescueTeams = () => {
  const [selected, setSelected] = useState(TEAMS[0])

  return (
    <div className="h-full flex gap-3 overflow-hidden text-slate-200 relative">
      
      {/* Subtle Background Glow to match CommandCenter */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex-1 flex flex-col z-10 w-full max-w-[1600px] mx-auto">
        
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-shrink-0 mb-3 px-1">
          <div>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-0.5 flex items-center gap-1.5">
              <Ambulance className="w-3 h-3" /> Field Operations
            </p>
            <h1 className="text-white font-black text-xl tracking-tight">Rescue Teams</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[9px] text-slate-300 flex items-center gap-1.5 font-bold bg-[#111827]/80 border border-white/10 px-2.5 py-1 rounded-md backdrop-blur-sm shadow-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Tactical Comms <span className="text-emerald-400 ml-0.5">Secure</span>
             </div>
          </div>
        </div>

        {/* ── Main Scrollable Content ──────────────────────── */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-none pb-2 space-y-3">

          {/* ── Top KPI Row ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
             <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl p-3 shadow-md relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-blue-500/10 border-blue-500/30">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Active Teams</p>
                <p className="text-lg font-black text-white tracking-tight">4</p>
             </div>
             <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl p-3 shadow-md relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-emerald-500/10 border-emerald-500/30">
                    <HeartPulse className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Overall Health</p>
                <p className="text-lg font-black text-white tracking-tight">97%</p>
             </div>
             <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl p-3 shadow-md relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-orange-500/10 border-orange-500/30">
                    <Users className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Personnel Deployed</p>
                <p className="text-lg font-black text-white tracking-tight">22</p>
             </div>
             <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl p-3 shadow-md relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-purple-500/10 border-purple-500/30">
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Ongoing Operations</p>
                <p className="text-lg font-black text-white tracking-tight">3</p>
             </div>
          </div>

          {/* ── Middle Row: Map & Selected Team Intel ───────────────────────────── */}
          <div className="grid grid-cols-12 gap-3 flex-shrink-0" style={{ height: '280px' }}>
            
            {/* Tactical Map */}
            <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
              <Panel title="Tactical Operations Map" action={<div className="flex items-center gap-1.5"><Crosshair className="w-3 h-3 text-emerald-400 animate-spin-slow"/></div>} noPad className="flex-1">
                <div className="flex-1 relative bg-[#0a0f18] rounded-b-xl overflow-hidden shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]">
                  <MapContainer center={[selected.lat, selected.lng]} zoom={11} style={{ height: '100%', width: '100%', background: 'transparent' }} zoomControl={false} attributionControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <Polyline positions={routePositions} color={selected.color} weight={2} dashArray="4, 8" opacity={0.6} className="animate-pulse" />
                    
                    {TEAMS.map(team => (
                       <Marker key={team.id} position={[team.lat, team.lng]} icon={L.divIcon({
                          className: '',
                          html: `<div style="width:16px;height:16px;background:${team.color};border-radius:50%;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 15px ${team.color};"></div>`,
                          iconSize: [16,16], iconAnchor: [8,8]
                       })}>
                          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                             <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: team.color }}>{team.name}</div>
                          </Tooltip>
                       </Marker>
                    ))}
                  </MapContainer>
                  
                  {/* Vignette */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(10,13,20,1)]" />
                  
                  <div className="absolute bottom-3 right-3 bg-[#0a0d14]/80 border border-white/10 rounded-md p-2 flex flex-col backdrop-blur-sm shadow-md z-[1000]">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Focus Tracking</p>
                    <p className="text-[10px] font-black text-white">{selected.name}</p>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Selected Team Intel */}
            <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
              <Panel title="Live Team Intel" action={<span className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 font-bold uppercase tracking-wider" style={{ background: `${selected.color}20`, color: selected.color }}>{selected.status}</span>} className="flex-1">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-inner" style={{ background: `${selected.color}15`, borderColor: `${selected.color}30` }}>
                         <Shield className="w-5 h-5" style={{ color: selected.color }} />
                       </div>
                       <div>
                         <h3 className="font-black text-sm text-white mb-0.5">{selected.name}</h3>
                         <p className="text-[9px] text-slate-400 font-mono">ID: {selected.id} • {selected.members} Members</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-[#0a0f18]/60 border border-white/5 p-2 rounded-lg">
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1">Health</p>
                          <p className="text-sm font-black text-white font-mono">{selected.health}%</p>
                       </div>
                       <div className="bg-[#0a0f18]/60 border border-white/5 p-2 rounded-lg">
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1">Fuel</p>
                          <p className="text-sm font-black text-white font-mono">{selected.fuel}%</p>
                       </div>
                       <div className="bg-[#0a0f18]/60 border border-white/5 p-2 rounded-lg">
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1">Vehicle</p>
                          <p className="text-[10px] font-bold text-slate-300">{selected.vehicle}</p>
                       </div>
                       <div className="bg-[#0a0f18]/60 border border-white/5 p-2 rounded-lg">
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1">Signal</p>
                          <p className="text-[10px] font-bold text-slate-300">{selected.signal}</p>
                       </div>
                    </div>

                    <div>
                       <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Loadout</p>
                       <div className="flex flex-wrap gap-1.5">
                          {selected.equipment.map((eq, i) => (
                             <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-slate-300">{eq}</span>
                          ))}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                        <button className="w-full py-2 px-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all border border-blue-500/30 flex items-center justify-center gap-1.5">
                          <Phone className="w-3 h-3" /> Connect
                        </button>
                        <button className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all border border-white/10 flex items-center justify-center gap-1.5">
                          <MapIcon className="w-3 h-3" /> Re-route
                        </button>
                    </div>
                 </div>
              </Panel>
            </div>

          </div>

          {/* ── Bottom Row: Teams Table ────────────────────────────────── */}
          <div className="flex-shrink-0 pb-2">
            <Panel title="TACTICAL UNIT ROSTER" action={<span className="text-[9px] text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-white/5 shadow-inner">{TEAMS.length} UNITS</span>} noPad>
              <div className="w-full overflow-x-auto scrollbar-none">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0f172a]/80 text-[9px] text-slate-400 uppercase tracking-widest">
                      <th className="font-bold py-3 px-4 w-1/4">Unit Designation</th>
                      <th className="font-bold py-3 px-4">Current Task</th>
                      <th className="font-bold py-3 px-4">Status</th>
                      <th className="font-bold py-3 px-4">Members</th>
                      <th className="font-bold py-3 px-4">Update</th>
                      <th className="font-bold py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {TEAMS.map(team => (
                      <tr key={team.id} onClick={() => setSelected(team)} className={`transition-colors group cursor-pointer ${selected.id === team.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}>
                        <td className="py-2.5 px-4">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 w-6 h-6 rounded-md flex items-center justify-center border shadow-inner" style={{ background: `${team.color}10`, borderColor: `${team.color}30` }}>
                               <Shield className="w-3 h-3" style={{ color: team.color }} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors">{team.name}</p>
                              <p className="text-[8px] text-slate-500 uppercase tracking-widest">{team.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <p className="text-[10px] text-slate-300 font-bold">{team.task}</p>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm"
                            style={{ background: `${team.color}15`, color: team.color, border: `1px solid ${team.color}30` }}>
                            {team.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex -space-x-1.5">
                            {Array.from({ length: Math.min(3, team.members) }).map((_, i) => (
                              <div key={i} className="w-5 h-5 rounded-full bg-slate-800 border border-[#111827] flex items-center justify-center shadow-sm">
                                <User className="w-3 h-3 text-slate-400" />
                              </div>
                            ))}
                            {team.members > 3 && (
                              <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-[#111827] flex items-center justify-center text-[8px] font-bold text-blue-400 shadow-sm">
                                +{team.members - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <p className="text-[10px] text-slate-400 font-bold font-mono">{team.update}</p>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button className={`text-[9px] font-bold border rounded-md px-3 py-1.5 transition-all shadow-sm ${selected.id === team.id ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-slate-400 border-white/10 hover:bg-white/5'}`}>
                            {selected.id === team.id ? 'Tracking' : 'Track'}
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

export default RescueTeams
