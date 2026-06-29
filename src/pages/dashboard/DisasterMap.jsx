import { useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Plus, Minus, Crosshair } from 'lucide-react'

// Dummy Data
const INCIDENTS = [
  { id: '1', lat: 13.0827, lng: 80.2707, priority: 'CRITICAL', victims: 5 },
  { id: '2', lat: 13.0500, lng: 80.2400, priority: 'CRITICAL', victims: 3 },
  { id: '3', lat: 12.9711, lng: 80.0404, priority: 'HIGH', victims: 2 },
  { id: '4', lat: 13.0200, lng: 80.2000, priority: 'HIGH', victims: 1 },
]

const TEAMS = [
  { id: 'T1', lat: 13.0600, lng: 80.2500 },
  { id: 'T2', lat: 12.9900, lng: 80.1000 },
]

// Custom Markers
const createVictimMarker = (num, isCritical) => L.divIcon({
  className: '',
  html: `
    <div style="width: 28px; height: 28px; border-radius: 50%; background: ${isCritical ? '#ef4444' : '#f59e0b'}33; border: 1px solid ${isCritical ? '#ef4444' : '#f59e0b'}80; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
      <div style="width: 18px; height: 18px; border-radius: 50%; background: ${isCritical ? '#ef4444' : '#f59e0b'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; box-shadow: 0 0 10px ${isCritical ? '#ef4444' : '#f59e0b'}">
        ${num}
      </div>
    </div>
  `,
  iconSize: [28, 28], iconAnchor: [14, 14]
})

const createIconMarker = (color, initial) => L.divIcon({
  className: '',
  html: `
    <div style="width: 22px; height: 22px; border-radius: 6px; background: ${color}20; border: 1px solid ${color}80; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
      <div style="color: ${color}; font-weight: 900; font-size: 11px;">
        ${initial}
      </div>
    </div>
  `,
  iconSize: [22, 22], iconAnchor: [11, 11]
})

export const DisasterMap = () => {
  const [mapRef, setMapRef] = useState(null)

  return (
    <div className="h-full flex flex-col gap-3">
      
      {/* Header */}
      <div className="rounded-xl px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight mb-1">Disaster Map - Live</h1>
          <p className="text-[11px] text-slate-400">Live tracking of incidents, teams and resources</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
           <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* Main Map Container */}
        <div className="flex-1 rounded-xl overflow-hidden relative border border-white/5 bg-[#0f172a] flex flex-col">
           <div className="flex-1 relative min-h-[400px]">
             <MapContainer 
               center={[13.015, 80.14]} 
               zoom={11} 
               style={{ height: '100%', width: '100%', background: 'transparent' }} 
               zoomControl={false} 
               attributionControl={false}
               ref={setMapRef}
             >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

                {/* Heatmap effect for victims */}
                {INCIDENTS.map((inc, i) => (
                  <div key={`heat-${i}`}>
                     <Circle center={[inc.lat, inc.lng]} radius={1500 + inc.victims * 500} pathOptions={{ stroke: false, fillColor: inc.priority === 'CRITICAL' ? '#ef4444' : '#f59e0b', fillOpacity: 0.15 }} />
                     <Circle center={[inc.lat, inc.lng]} radius={3000 + inc.victims * 800} pathOptions={{ stroke: false, fillColor: inc.priority === 'CRITICAL' ? '#ef4444' : '#f59e0b', fillOpacity: 0.05 }} />
                     <Marker position={[inc.lat, inc.lng]} icon={createVictimMarker(inc.victims, inc.priority === 'CRITICAL')} />
                  </div>
                ))}

                {/* Nodes and resources mock */}
                <Marker position={[13.0600, 80.2500]} icon={createIconMarker('#3b82f6', 'A')} />
                <Marker position={[12.9900, 80.1000]} icon={createIconMarker('#3b82f6', 'H')} />
                <Marker position={[13.0820, 80.2200]} icon={createIconMarker('#10b981', 'S')} />
                
                {/* Path mock */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 400 }}>
                   <line x1="40%" y1="60%" x2="60%" y2="40%" stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />
                   <line x1="60%" y1="40%" x2="70%" y2="30%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />
                </svg>

             </MapContainer>

             <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 80px rgba(10,13,20,0.9)' }} />

             {/* Legend overlay */}
             <div className="absolute top-5 left-5 z-[1000] flex items-center gap-4">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> <span className="text-[10px] text-slate-300 font-bold">Incidents</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[8px] text-blue-400 font-black">T</div> <span className="text-[10px] text-slate-300 font-bold">Teams</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-400/20 border border-blue-400/50 flex items-center justify-center text-[8px] text-blue-300 font-black">H</div> <span className="text-[10px] text-slate-300 font-bold">Hospitals</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center text-[8px] text-emerald-300 font-black">S</div> <span className="text-[10px] text-slate-300 font-bold">Shelters</span></div>
             </div>

           </div>

           {/* Stats Footer */}
           <div className="bg-[#0d1117] border-t border-white/5 grid grid-cols-5 divide-x divide-white/5 shrink-0">
             {[
               { l: 'Active Incidents', v: '12', c: '#ef4444' },
               { l: 'Rescue Teams', v: '8', c: '#10b981' },
               { l: 'Volunteers', v: '24', c: '#3b82f6' },
               { l: 'Resources', v: '15', c: '#f59e0b' },
               { l: 'Response Time', v: '12m avg', c: '#a855f7' },
             ].map(s => (
                <div key={s.l} className="p-4 flex flex-col items-center justify-center">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{s.l}</p>
                   <p className="text-xl font-black" style={{ color: s.c }}>{s.v}</p>
                </div>
             ))}
           </div>
        </div>

        {/* Right Sidebar - Map Filters */}
        <div className="w-64 flex flex-col gap-4 min-h-0">
           
           <div className="flex-1 rounded-xl overflow-hidden bg-[#0d1117] border border-white/5 flex flex-col">
              <div className="px-5 py-4 border-b border-white/5">
                 <h2 className="text-[11px] text-white font-bold uppercase tracking-wider">Map Filters</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                 
                 <div>
                    <label className="flex items-center gap-3 mb-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-white/10 bg-[#121822] checked:bg-blue-500 accent-blue-500" />
                       <span className="text-[11px] font-bold text-white">Incidents</span>
                    </label>
                    <div className="pl-6 space-y-2">
                       <label className="flex items-center justify-between text-[10px] cursor-pointer hover:bg-white/5 px-2 py-1 rounded">
                          <span className="text-blue-400 font-bold">All Incidents</span>
                          <input type="radio" name="inc" defaultChecked className="accent-blue-500" />
                       </label>
                       <label className="flex items-center justify-between text-[10px] cursor-pointer hover:bg-white/5 px-2 py-1 rounded">
                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"/> <span className="text-slate-300 font-bold">Critical</span></div>
                          <input type="radio" name="inc" className="accent-red-500" />
                       </label>
                       <label className="flex items-center justify-between text-[10px] cursor-pointer hover:bg-white/5 px-2 py-1 rounded">
                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"/> <span className="text-slate-300 font-bold">High</span></div>
                          <input type="radio" name="inc" className="accent-orange-500" />
                       </label>
                       <label className="flex items-center justify-between text-[10px] cursor-pointer hover:bg-white/5 px-2 py-1 rounded">
                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500"/> <span className="text-slate-300 font-bold">Medium</span></div>
                          <input type="radio" name="inc" className="accent-yellow-500" />
                       </label>
                       <label className="flex items-center justify-between text-[10px] cursor-pointer hover:bg-white/5 px-2 py-1 rounded">
                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"/> <span className="text-slate-300 font-bold">Low</span></div>
                          <input type="radio" name="inc" className="accent-green-500" />
                       </label>
                    </div>
                 </div>

                 <div>
                    <label className="flex items-center gap-3 mb-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-white/10 bg-[#121822] checked:bg-blue-500 accent-blue-500" />
                       <span className="text-[11px] font-bold text-white">Rescue Teams</span>
                    </label>
                    <div className="pl-6">
                       <label className="flex items-center justify-between text-[10px] cursor-pointer hover:bg-white/5 px-2 py-1 rounded">
                          <span className="text-blue-400 font-bold">All Teams</span>
                          <input type="radio" name="team" defaultChecked className="accent-blue-500" />
                       </label>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-white/10 bg-[#121822] checked:bg-blue-500 accent-blue-500" />
                       <span className="text-[11px] font-bold text-white">Hospitals</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-white/10 bg-[#121822] checked:bg-blue-500 accent-blue-500" />
                       <span className="text-[11px] font-bold text-white">Shelters</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-white/10 bg-[#121822] checked:bg-blue-500 accent-blue-500" />
                       <span className="text-[11px] font-bold text-white">Relief Camps</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-white/10 bg-[#121822] checked:bg-blue-500 accent-blue-500" />
                       <span className="text-[11px] font-bold text-white">Road Status</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-white/10 bg-[#121822] checked:bg-blue-500 accent-blue-500" />
                       <span className="text-[11px] font-bold text-white">Heatmap</span>
                    </label>
                 </div>
              </div>
           </div>

           {/* Zoom Controls */}
           <div className="flex items-center justify-center gap-2">
              <button onClick={() => mapRef?.zoomIn()} className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0d1117] border border-white/5 hover:bg-white/5 transition-colors text-slate-300"><Plus className="w-4 h-4"/></button>
              <button onClick={() => mapRef?.zoomOut()} className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0d1117] border border-white/5 hover:bg-white/5 transition-colors text-slate-300"><Minus className="w-4 h-4"/></button>
              <button onClick={() => mapRef?.setView([13.015, 80.14], 11)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0d1117] border border-white/5 hover:bg-white/5 transition-colors text-slate-300"><Crosshair className="w-4 h-4"/></button>
           </div>
        </div>

      </div>

    </div>
  )
}

export default DisasterMap
