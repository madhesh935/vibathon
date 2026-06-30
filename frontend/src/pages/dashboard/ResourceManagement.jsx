import { useState } from 'react'
import { Boxes, Truck, Ship, Wrench, Activity, Tent, Fan, Droplets, ExternalLink, ShieldAlert } from 'lucide-react'

const STATS = [
  { label: 'All Resources', count: 156, icon: Boxes, color: '#f59e0b' },
  { label: 'Vehicles', count: 48, icon: Truck, color: '#3b82f6' },
  { label: 'Boats', count: 12, icon: Ship, color: '#3b82f6' },
  { label: 'Equipment', count: 36, icon: Wrench, color: '#9ca3af' },
  { label: 'Medical Kits', count: 24, icon: Activity, color: '#10b981' },
  { label: 'Shelters', count: 18, icon: Tent, color: '#a855f7' },
]

const TABS = ['All Resources', 'Vehicles', 'Boats', 'Equipment', 'Medical', 'Shelters']

const RESOURCES = [
  { id: 'VEH-001', type: 'Ambulance', name: 'Ambulance 01', location: 'Anna Nagar', status: 'Active', avail: 'Available', c: '#10b981' },
  { id: 'VEH-002', type: 'Ambulance', name: 'Ambulance 02', location: 'T. Nagar', status: 'Active', avail: 'Available', c: '#10b981' },
  { id: 'BOAT-001', type: 'Rescue Boat', name: 'Rescue Boat 01', location: 'Adyar', status: 'Active', avail: 'Available', c: '#10b981' },
  { id: 'EQU-001', type: 'Boat', name: '40HP Motor', location: 'Perungudi', status: 'Active', avail: 'Available', c: '#10b981' },
  { id: 'MED-001', type: 'Medical Kit', name: 'Trauma Kit 01', location: 'Velachery', status: 'Active', avail: 'Available', c: '#10b981' },
  { id: 'MED-002', type: 'Medical Kit', name: 'First Aid Kit 02', location: 'Anna Nagar', status: 'In Use', avail: 'Busy', c: '#f59e0b' },
  { id: 'SHEL-001', type: 'Shelter', name: 'Relief Camp 1', location: 'Koyambedu', status: 'Active', avail: 'Available', c: '#10b981' },
  { id: 'SHEL-002', type: 'Shelter', name: 'Relief Camp 2', location: 'Tambaram', status: 'Active', avail: 'Available', c: '#10b981' },
]

const getIcon = (type) => {
  if (type === 'Ambulance') return Truck
  if (type === 'Rescue Boat' || type === 'Boat') return Ship
  if (type === 'Medical Kit') return Activity
  if (type === 'Shelter') return Tent
  return Wrench
}

export const ResourceManagement = () => {
  const [activeTab, setActiveTab] = useState('All Resources')

  return (
    <div className="h-full flex gap-3">
      
      <div className="flex-1 flex flex-col min-w-0 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight mb-1">Resource Management</h1>
            <p className="text-[11px] text-slate-400">Monitor and manage all available resources</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Network<br/><span className="text-emerald-500">Online</span></div>
             <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> AI Engine<br/><span className="text-emerald-500">Active</span></div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="p-5 border-b border-white/5 flex-shrink-0">
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {STATS.map(s => (
                 <div key={s.label} className="bg-[#121822] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-white/5 cursor-pointer">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                       <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-black text-white mb-1 leading-none">{s.count}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Tabs */}
        <div className="px-5 py-3 border-b border-white/5 flex gap-2 flex-shrink-0 overflow-x-auto">
          {TABS.map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)}
               className={`px-4 py-2 rounded border text-[11px] font-bold transition-colors whitespace-nowrap ${
                  activeTab === tab 
                     ? 'bg-red-600/20 border-red-500/50 text-red-500' 
                     : 'bg-[#121822] border-white/10 text-slate-400 hover:bg-white/5'
               }`}>
               {tab}
             </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-5">
          <div className="bg-[#121822] border border-white/5 rounded-xl overflow-hidden">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr>
                   <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Resource ID</th>
                   <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Type</th>
                   <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Name / Description</th>
                   <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Location</th>
                   <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Status</th>
                   <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Availability</th>
                   <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {RESOURCES.map((res, i) => {
                   const Icon = getIcon(res.type)
                   return (
                     <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                             <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                             <span className="text-[11px] font-mono font-bold text-slate-300">{res.id}</span>
                          </div>
                       </td>
                       <td className="py-3 px-5">
                          <div className="flex items-center gap-2 text-[11px] text-white">
                             <Icon className="w-3.5 h-3.5 text-slate-400" /> {res.type}
                          </div>
                       </td>
                       <td className="py-3 px-5 text-[11px] text-slate-300 font-bold">{res.name}</td>
                       <td className="py-3 px-5 text-[11px] text-slate-400">{res.location}</td>
                       <td className="py-3 px-5">
                          <span className="text-[11px] font-bold" style={{ color: res.c }}>{res.status}</span>
                       </td>
                       <td className="py-3 px-5">
                          <span className="text-[11px] font-bold" style={{ color: res.c }}>{res.avail}</span>
                       </td>
                       <td className="py-3 px-5">
                          <button className="bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded text-[10px] font-bold transition-colors">
                             View
                          </button>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ResourceManagement
