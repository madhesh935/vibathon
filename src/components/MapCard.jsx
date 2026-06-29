import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const priorityMarker = (priority) => {
  const colors = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  }
  const color = colors[priority] || '#64748b'

  return divIcon({
    html: `
      <div style="
        width: 28px; height: 28px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px ${color}88;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px;
      ">
        <span style="color:white; font-weight:bold;">!</span>
      </div>
    `,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

const resourceMarker = (type) => {
  const icons = { ambulance: '🚑', fire_truck: '🚒', rescue_team: '🚁', default: '📍' }
  const icon = icons[type] || icons.default

  return divIcon({
    html: `<div style="font-size:22px; text-shadow: 0 0 6px rgba(0,0,0,0.8);">${icon}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

export const MapCard = ({
  victims = [],
  resources = [],
  center = [13.0827, 80.2707],
  zoom = 12,
  height = '400px',
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl overflow-hidden border border-slate-700 ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {victims.map((v, i) => (
          <Marker key={i} position={[v.lat, v.lng]} icon={priorityMarker(v.priority)}>
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-bold text-white">{v.name || 'Victim'}</p>
                <p className="text-slate-300 text-xs mt-1">{v.type}</p>
                {v.message && <p className="text-slate-400 text-xs mt-1 italic">"{v.message}"</p>}
                <span className={`text-xs font-semibold ${
                  v.priority === 'CRITICAL' ? 'text-red-400' :
                  v.priority === 'HIGH' ? 'text-orange-400' : 'text-green-400'
                }`}>{v.priority}</span>
              </div>
            </Popup>
            {v.priority === 'CRITICAL' && (
              <Circle center={[v.lat, v.lng]} radius={200} color="#ef4444" fillColor="#ef4444" fillOpacity={0.1} />
            )}
          </Marker>
        ))}
        {resources.map((r, i) => (
          <Marker key={`r-${i}`} position={[r.lat, r.lng]} icon={resourceMarker(r.type)}>
            <Popup>
              <div>
                <p className="font-bold text-white">{r.name}</p>
                <p className="text-slate-400 text-xs capitalize">{r.type?.replace('_', ' ')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapCard
