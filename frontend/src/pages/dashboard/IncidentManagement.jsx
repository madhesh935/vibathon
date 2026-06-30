import { useState } from 'react'
import {
  Search, Filter, ChevronRight, Clock, MapPin, Activity, ListChecks,
  AlertTriangle, User, Phone, CheckCircle2, ChevronLeft, Map, ExternalLink,
  MessageSquare, Users, Building2, Flame, Droplets
} from 'lucide-react'

const INCIDENTS = [
  { id: `RQ-${new Date().getFullYear()}-0615-0897`, type: 'Flood', location: 'Anna Nagar, Chennai', victims: 2, priority: 'CRITICAL', status: 'Awaiting Rescue', time: '2 min ago', icon: Droplets },
  { id: `RQ-${new Date().getFullYear()}-0615-0896`, type: 'Building Collapse', location: 'T. Nagar, Chennai', victims: 1, priority: 'HIGH', status: 'AI Analyzing', time: '5 min ago', icon: Building2 },
  { id: `RQ-${new Date().getFullYear()}-0615-0895`, type: 'Medical Emergency', location: 'Vadapalani, Chennai', victims: 3, priority: 'HIGH', status: 'Verified', time: '7 min ago', icon: Activity },
  { id: `RQ-${new Date().getFullYear()}-0615-0894`, type: 'Flood', location: 'Velachery, Chennai', victims: 3, priority: 'MEDIUM', status: 'Team Assigned', time: '12 min ago', icon: Droplets },
  { id: `RQ-${new Date().getFullYear()}-0615-0893`, type: 'Fire', location: 'Perambur, Chennai', victims: 0, priority: 'LOW', status: 'New Report', time: '15 min ago', icon: Flame },
  { id: `RQ-${new Date().getFullYear()}-0615-0892`, type: 'Flood', location: 'Adyar, Chennai', victims: 2, priority: 'HIGH', status: 'AI Analyzing', time: '20 min ago', icon: Droplets },
  { id: `RQ-${new Date().getFullYear()}-0615-0891`, type: 'Medical Emergency', location: 'Koyambedu, Chennai', victims: 0, priority: 'MEDIUM', status: 'New Report', time: '25 min ago', icon: Activity },
]

export const IncidentManagement = () => {
  const [selected, setSelected] = useState(INCIDENTS[0])
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="h-full flex p-4 gap-4" style={{ background: '#0a0d14' }}>
      
      {/* ── LEFT: Incident Queue ── */}
      <div className="flex-[3] flex flex-col min-w-0 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex-shrink-0">
          <h1 className="text-white font-bold text-lg leading-tight mb-1">Incident Queue</h1>
          <p className="text-[11px] text-slate-400">Live incoming incidents from all sources</p>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex gap-2">
            <button className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full text-[11px] font-bold">All (24)</button>
            <button className="bg-[#121822] text-slate-300 border border-white/10 px-4 py-1.5 rounded-full text-[11px] font-bold hover:bg-white/5 flex items-center gap-1.5">Critical <span className="text-red-500 bg-red-500/20 px-1.5 rounded-full text-[10px]">(7)</span></button>
            <button className="bg-[#121822] text-slate-300 border border-white/10 px-4 py-1.5 rounded-full text-[11px] font-bold hover:bg-white/5 flex items-center gap-1.5">High <span className="text-orange-500 bg-orange-500/20 px-1.5 rounded-full text-[10px]">(8)</span></button>
            <button className="bg-[#121822] text-slate-300 border border-white/10 px-4 py-1.5 rounded-full text-[11px] font-bold hover:bg-white/5 flex items-center gap-1.5">Medium <span className="text-yellow-500 bg-yellow-500/20 px-1.5 rounded-full text-[10px]">(5)</span></button>
            <button className="bg-[#121822] text-slate-300 border border-white/10 px-4 py-1.5 rounded-full text-[11px] font-bold hover:bg-white/5 flex items-center gap-1.5">Low <span className="text-green-500 bg-green-500/20 px-1.5 rounded-full text-[10px]">(3)</span></button>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input placeholder="Search incidents..." className="w-56 bg-[#121822] border border-white/10 text-white text-[11px] placeholder-slate-500 rounded-lg pl-8 pr-4 py-1.5 focus:outline-none focus:border-white/20" />
            </div>
            <button className="bg-[#121822] border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 text-[11px] font-bold flex items-center gap-2 hover:bg-white/5">
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0d1117] z-10">
              <tr>
                <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">ID</th>
                <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Type</th>
                <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Location</th>
                <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5 text-center">Victims</th>
                <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Priority</th>
                <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5">Status</th>
                <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5 text-right">Reported</th>
              </tr>
            </thead>
            <tbody>
              {INCIDENTS.map((inc, i) => {
                const isSel = selected.id === inc.id
                return (
                  <tr key={inc.id} onClick={() => setSelected(inc)}
                    className={`cursor-pointer transition-colors ${isSel ? 'bg-white/5' : i % 2 === 0 ? 'bg-transparent' : 'bg-[#121822]'} hover:bg-white/10`}>
                    <td className="py-3 px-5">
                      <span className="text-[11px] font-bold text-slate-300">{inc.id}</span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <inc.icon className={`w-3.5 h-3.5 ${inc.priority === 'CRITICAL' || inc.priority === 'HIGH' ? 'text-blue-400' : 'text-emerald-400'}`} />
                        <span className="text-[11px] text-white font-medium">{inc.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-[11px] text-slate-400">{inc.location}</td>
                    <td className="py-3 px-5 text-[11px] text-white text-center">{inc.victims}</td>
                    <td className="py-3 px-5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                        inc.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                        inc.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                        inc.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                        'bg-green-500/20 text-green-500 border-green-500/30'
                      }`}>{inc.priority}</span>
                    </td>
                    <td className="py-3 px-5 text-[11px] text-slate-400">{inc.status}</td>
                    <td className="py-3 px-5 text-[11px] text-slate-500 text-right">{inc.time}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RIGHT: Incident Intelligence ── */}
      <div className="flex-[2] flex flex-col min-w-0 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Header Content */}
        <div className="p-5 border-b border-white/5 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(239,68,68,0.1) 0%, transparent 70%)' }} />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
             <button className="text-[11px] text-blue-400 font-semibold flex items-center gap-1 hover:text-blue-300">
               <ChevronLeft className="w-3.5 h-3.5" /> Back to Map
             </button>
             <button className="text-[11px] text-blue-400 font-semibold flex items-center gap-1 hover:text-blue-300">
               View on Map
             </button>
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500/30 flex items-center justify-center flex-shrink-0">
               <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
               <div className="flex items-center gap-2 mb-1">
                 <h2 className="text-xl font-black text-white">{selected.id}</h2>
                 <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30 font-black uppercase tracking-wider">{selected.priority}</span>
               </div>
               <p className="text-[12px] text-slate-300 font-bold mb-3">{selected.type} Emergency</p>
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500">Reported: <span className="text-slate-300">09:31 AM, {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span></p>
                 <p className="text-[10px] text-slate-500">Source: <span className="text-slate-300">Mobile App</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 flex-shrink-0 px-2">
          {['Overview', 'AI Analysis', 'Resources', 'Communication'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab ? 'border-red-500 text-red-500' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'Overview' && (
            <div className="flex flex-col h-full">
               <div className="grid grid-cols-2 gap-5 mb-6">
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Location</p>
                   <p className="text-sm text-white font-bold mb-0.5">{selected.location}</p>
                   <p className="text-[10px] text-slate-400 font-mono mb-1">12.9711, 80.0404</p>
                   <p className="text-[10px] text-emerald-400">Accuracy: ± 5m</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">AI Triage</p>
                   <div className="space-y-2 text-[11px]">
                     <div className="flex justify-between border-b border-white/5 pb-1">
                       <span className="text-slate-400">Priority</span>
                       <span className="text-red-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"/> CRITICAL</span>
                     </div>
                     <div className="flex justify-between border-b border-white/5 pb-1">
                       <span className="text-slate-400">Detected</span>
                       <span className="text-red-400 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Flood Risk</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-slate-400">Risk Level</span>
                       <span className="text-orange-500 font-bold flex items-center gap-1"><Activity className="w-3 h-3"/> High</span>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="mb-6">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Victims</p>
                 <p className="text-white text-sm font-bold">2 Adults, 0 Children</p>
               </div>

               <div className="mb-6">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Emergency Message</p>
                 <div className="bg-[#121822] border border-white/5 rounded-lg p-3">
                   <p className="text-white text-sm">"Water entered house. We are trapped."</p>
                 </div>
               </div>

               <div className="mb-6">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Reported By</p>
                 <p className="text-white text-sm font-bold flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500"/> +91 98765 43210</p>
               </div>

               <div className="mt-auto">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Recommendation</p>
                 <p className="text-[12px] text-slate-300 leading-relaxed mb-6">Deploy rescue team immediately. Send medical support.</p>
                 
                 <div className="flex gap-3">
                   <button className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] py-2.5 rounded-lg transition-colors">
                     Assign Team
                   </button>
                   <button className="flex-1 bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10 font-bold text-[11px] py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                     <MessageSquare className="w-3.5 h-3.5" /> Send Message
                   </button>
                   <button className="bg-[#121822] border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-[11px] px-4 py-2.5 rounded-lg transition-colors">
                     Update Status
                   </button>
                 </div>
               </div>
            </div>
          )}
          {activeTab !== 'Overview' && (
             <div className="h-full flex items-center justify-center">
                <p className="text-slate-500 text-sm">Content for {activeTab} will appear here.</p>
             </div>
          )}
        </div>

      </div>

    </div>
  )
}

export default IncidentManagement
