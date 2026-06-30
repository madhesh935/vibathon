import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Navigation, RefreshCw, Building2, ShieldCheck,
  Ambulance, ChevronRight, Share2, ExternalLink, AlertTriangle,
  Waves, Users, Heart, Filter
} from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const TABS = ['Victims','Rescue Teams','Hospitals','Shelters','Flood Zones']

const HOSPITALS = [
  { name:'City Hospital',        dist:'2.1 km', beds:120, avail:45, status:'Open',    Icon:Building2, color:'#10b981' },
  { name:'Nearest Hospital',     dist:'1.4 km', beds:80,  avail:20, status:'Open',    Icon:Building2, color:'#10b981' },
  { name:'Relief Station',       dist:'0.8 km', beds:null,avail:null,status:'Active', Icon:ShieldCheck,color:'#3b82f6' },
]
const SHELTERS = [
  { name:'Community Shelter A', dist:'1.2 km', cap:200, avail:87, status:'Open',    color:'#10b981' },
  { name:'Relief Camp B',        dist:'2.4 km', cap:350, avail:120,status:'Open',    color:'#10b981' },
  { name:'Safe Zone C',          dist:'3.8 km', cap:150, avail:12, status:'Limited', color:'#f59e0b' },
]

const mkPin = (color) => L.divIcon({
  className:'', iconSize:[20,20], iconAnchor:[10,20],
  html:`<div style="position:relative"><div style="width:20px;height:20px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px ${color}80"></div><div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid ${color};margin:0 auto;margin-top:-1px"></div></div>`
})

export const LocationMap = () => {
  const navigate = useNavigate()
  const [tab, setTab]         = useState('Hospitals')
  const [gps, setGps]         = useState(null)
  const [gpsState, setGpsState] = useState('idle')
  const [showAll, setShowAll]  = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) { setGpsState('denied'); return }
    setGpsState('locating')
    navigator.geolocation.getCurrentPosition(
      p => { setGps({ lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy) }); setGpsState('found') },
      () => setGpsState('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const center = gps ? [gps.lat, gps.lng] : [12.9716, 80.0404]

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0d1117]">


      {/* ── Tab strip ────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#0d1117] px-4 flex gap-1 overflow-x-auto scrollbar-none"
        style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              tab===t ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}>{t}</button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div className="flex-1 min-h-0 grid grid-cols-[1fr_320px] overflow-hidden">

        {/* Map */}
        <div className="flex flex-col overflow-hidden relative">
          <div className="flex-1 relative overflow-hidden">
            <MapContainer center={center} zoom={14} style={{ height:'100%', width:'100%' }} zoomControl={false} attributionControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"/>
              {gps && (
                <>
                  <CircleMarker center={[gps.lat, gps.lng]} radius={10}
                    pathOptions={{ fillColor:'#ef4444', fillOpacity:1, color:'white', weight:3 }}>
                    <Popup><b>Your Location</b><br/>±{gps.acc}m accuracy</Popup>
                  </CircleMarker>
                  {/* Hospital markers */}
                  <Marker position={[gps.lat + 0.01, gps.lng + 0.008]} icon={mkPin('#ef4444')}>
                    <Popup>City Hospital · 2.1 km</Popup>
                  </Marker>
                  <Marker position={[gps.lat - 0.007, gps.lng + 0.012]} icon={mkPin('#10b981')}>
                    <Popup>Nearest Hospital · 1.4 km</Popup>
                  </Marker>
                  <Marker position={[gps.lat + 0.005, gps.lng - 0.009]} icon={mkPin('#3b82f6')}>
                    <Popup>Relief Station · 0.8 km</Popup>
                  </Marker>
                  <Marker position={[gps.lat - 0.012, gps.lng - 0.006]} icon={mkPin('#f59e0b')}>
                    <Popup>Relief Camp A · 1.2 km</Popup>
                  </Marker>
                </>
              )}
            </MapContainer>
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow:'inset 0 0 20px rgba(0,0,0,.6)' }}/>
          </div>

          {/* Your Location bar */}
          <div className="flex-shrink-0 bg-[#0d1117] px-4 py-3 flex items-center justify-between"
            style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-wide font-semibold">Your Location</p>
              <p className="text-white text-sm font-bold font-mono mt-0.5">
                {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'Acquiring GPS…'}
              </p>
              {gps && <p className="text-emerald-500 text-[10px] mt-0.5 font-semibold">● Live · ±{gps.acc}m accuracy</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setGpsState('locating')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-350 border border-white/5 bg-slate-900/50 hover:bg-white/5 hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5"/> Refresh
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
                <Share2 className="w-3.5 h-3.5"/> Share Location
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col overflow-y-auto scrollbar-none bg-[#0d1117]"
          style={{ borderLeft:'1px solid rgba(255,255,255,0.04)' }}>

          {/* Nearest Safe Zone */}
          <div className="p-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-3">Nearest Safe Zone</p>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400"/>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Green Park</p>
                <p className="text-slate-400 text-xs mt-0.5">1.2 km away · Open &amp; Safe</p>
              </div>
              <button className="text-[10px] font-bold text-emerald-400 hover:text-emerald-350 flex items-center gap-0.5">
                Directions <ChevronRight className="w-3 h-3"/>
              </button>
            </div>
          </div>

          {/* Hospitals */}
          <div className="p-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-500"/> Nearby Hospitals
              </p>
              <span className="text-[10px] text-slate-400">3 found</span>
            </div>
            <div className="space-y-2.5">
              {HOSPITALS.map(h => (
                <div key={h.name} className="rounded-xl border border-white/5 bg-[#0f172a]/60 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white text-xs font-bold">{h.name}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3"/> {h.dist}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background:`${h.color}15`, color:h.color }}>{h.status}</span>
                  </div>
                  {h.beds && <p className="text-slate-400 text-[10px]">{h.avail}/{h.beds} beds available</p>}
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg text-slate-350 border border-white/5 bg-slate-900/50 hover:bg-white/5 hover:text-white transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
                      Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shelters */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500"/> Nearby Shelters
              </p>
              <span className="text-[10px] text-slate-400">3 found</span>
            </div>
            <div className="space-y-2">
              {SHELTERS.map(s => (
                <div key={s.name} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#0f172a]/60 hover:bg-white/5 hover:border-red-500/30 transition-colors cursor-pointer">
                  <div>
                    <p className="text-white text-xs font-bold">{s.name}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{s.dist} · Cap. {s.cap}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md block mb-1"
                      style={{ background:`${s.color}15`, color:s.color }}>{s.status}</span>
                    <p className="text-[9px] text-slate-400">{s.avail} available</p>
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

export default LocationMap
