import { useState } from 'react'
import { Calendar, BarChart2, Download, ArrowUpRight, ArrowDownRight, Activity, CheckCircle2, AlertTriangle, Clock, Droplets, Building2, Flame, Search, Filter } from 'lucide-react'
import { downloadCSV } from '../../utils/download'

/* ── DYNAMIC DATA ───────────────────────────────────────────── */
const DETAILED_INCIDENTS = [
  { id: `RQ-${new Date().getFullYear()}-0615-0897`, icon: Droplets, type: 'Flood Emergency', severity: 'CRITICAL', loc: 'Anna Nagar, Chennai', coordinates: '13.0827° N, 80.2707° E', status: 'Assigning Team', reported: '2 mins ago', responseTime: '8m 15s', officer: 'Capt. Raj', c: '#ef4444' },
  { id: `RQ-${new Date().getFullYear()}-0615-0896`, icon: Building2, type: 'Building Collapse', severity: 'HIGH', loc: 'T. Nagar, Chennai', coordinates: '13.0418° N, 80.2341° E', status: 'AI Analyzing', reported: '5 mins ago', responseTime: 'Pending', officer: 'Pending', c: '#f59e0b' },
  { id: `RQ-${new Date().getFullYear()}-0615-0895`, icon: Activity, type: 'Medical Emergency', severity: 'HIGH', loc: 'Vadapalani, Chennai', coordinates: '13.0500° N, 80.2121° E', status: 'Verified', reported: '7 mins ago', responseTime: '11m 32s', officer: 'Dr. Sharma', c: '#f59e0b' },
  { id: `RQ-${new Date().getFullYear()}-0615-0894`, icon: Droplets, type: 'Urban Flooding', severity: 'MEDIUM', loc: 'Velachery, Chennai', coordinates: '12.9759° N, 80.2212° E', status: 'Team Assigned', reported: '12 mins ago', responseTime: '14m 05s', officer: 'Sgt. Kumar', c: '#eab308' },
  { id: `RQ-${new Date().getFullYear()}-0615-0893`, icon: Flame, type: 'Industrial Fire', severity: 'LOW', loc: 'Perambur, Chennai', coordinates: '13.1067° N, 80.2314° E', status: 'New Report', reported: '15 mins ago', responseTime: '-', officer: 'Unassigned', c: '#10b981' },
];

export const ReportsAnalytics = () => {
  const handleExport = () => {
    const headers = ['Case ID', 'Type', 'Severity', 'Location', 'Coordinates', 'Status', 'Reported', 'Response Time', 'Assigned Officer']
    const rows = DETAILED_INCIDENTS.map(inc => [
      inc.id, inc.type, inc.severity, inc.loc, inc.coordinates, inc.status, inc.reported, inc.responseTime, inc.officer
    ])
    downloadCSV(headers, rows, `Incidents_Report_${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div className="h-full flex gap-3 overflow-hidden text-slate-200 relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 flex flex-col z-10 w-full max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0 mb-4 px-1">
          <div>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
              <BarChart2 className="w-3 h-3" /> Data Intelligence
            </p>
            <h1 className="text-white font-black text-xl tracking-tight">Detailed Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
             <button className="bg-[#111827]/80 border border-white/10 px-4 py-2 rounded-lg text-xs text-slate-300 font-bold flex items-center gap-2 hover:bg-white/5 backdrop-blur-sm transition-colors cursor-pointer">
               <Calendar className="w-3.5 h-3.5 text-blue-400" /> {new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
             </button>
             <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-400 flex items-center gap-2 cursor-pointer">
               <Download className="w-3.5 h-3.5" /> Export Data
             </button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-none pb-4 space-y-4">
           
           {/* Row 1: Key Focus Metrics */}
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-red-500/30 transition-colors">
                 <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20">
                      <Activity className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Incidents</p>
                 </div>
                 <div className="relative z-10 flex items-end justify-between">
                    <p className="text-2xl font-black text-white tracking-tight">156</p>
                    <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded-md">
                       <ArrowUpRight className="w-3 h-3" /> +12%
                    </div>
                 </div>
              </div>

              <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                 <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resolved</p>
                 </div>
                 <div className="relative z-10 flex items-end justify-between">
                    <p className="text-2xl font-black text-white tracking-tight">52</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                       <ArrowDownRight className="w-3 h-3" /> 8%
                    </div>
                 </div>
              </div>

              <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
                 <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active</p>
                 </div>
                 <div className="relative z-10 flex items-end justify-between">
                    <p className="text-2xl font-black text-white tracking-tight">12</p>
                    <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded-md">
                       <ArrowUpRight className="w-3 h-3" /> +2
                    </div>
                 </div>
              </div>

              <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                 <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 border border-purple-500/20">
                      <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg Response</p>
                 </div>
                 <div className="relative z-10 flex items-end justify-between">
                    <p className="text-2xl font-black text-white tracking-tight">12<span className="text-sm text-slate-500">m</span> 45<span className="text-sm text-slate-500">s</span></p>
                    <div className="flex items-center gap-1 text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded-md">
                       <ArrowDownRight className="w-3 h-3" /> 2m
                    </div>
                 </div>
              </div>

           </div>

           {/* Row 2: Full Width Detailed Table */}
           <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-xl flex flex-col shadow-lg overflow-hidden flex-1 min-h-[400px]">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                   <h2 className="text-xs text-white font-bold uppercase tracking-wider flex items-center gap-2">
                     Detailed Incident Ledger
                   </h2>
                   <p className="text-[10px] text-slate-400 mt-1">Comprehensive view of all active and recent mission incidents.</p>
                </div>
                <div className="flex gap-2">
                   <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" placeholder="Search ID..." className="bg-black/20 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 w-48 transition-colors" />
                   </div>
                   <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                      <Filter className="w-3 h-3" /> Filters
                   </button>
                </div>
              </div>
              
              <div className="w-full overflow-x-auto p-1">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="text-[10px] text-slate-500 uppercase tracking-widest">
                      <th className="font-bold py-3 px-4 border-b border-white/5">Case ID</th>
                      <th className="font-bold py-3 px-3 border-b border-white/5">Details</th>
                      <th className="font-bold py-3 px-3 border-b border-white/5">Location Data</th>
                      <th className="font-bold py-3 px-3 border-b border-white/5">Severity</th>
                      <th className="font-bold py-3 px-3 border-b border-white/5">Status</th>
                      <th className="font-bold py-3 px-3 border-b border-white/5">Assigned Officer</th>
                      <th className="font-bold py-3 px-4 border-b border-white/5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {DETAILED_INCIDENTS.map((inc, i) => (
                      <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="py-2.5 px-4">
                           <span className="text-xs text-blue-400 font-bold tracking-wider cursor-pointer hover:underline">{inc.id}</span>
                           <p className="text-[9px] text-slate-500 mt-0.5">Reported {inc.reported}</p>
                        </td>
                        <td className="py-2.5 px-3">
                           <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 shadow-inner">
                                <inc.icon className="w-3.5 h-3.5" style={{ color: inc.c }} />
                              </div>
                              <div>
                                 <p className="text-xs text-white font-bold">{inc.type}</p>
                                 <p className="text-[9px] text-slate-400 mt-0.5">Resp: {inc.responseTime}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-2.5 px-3">
                           <p className="text-xs text-slate-300 font-medium">{inc.loc}</p>
                           <p className="text-[9px] text-slate-500 mt-0.5">{inc.coordinates}</p>
                        </td>
                        <td className="py-2.5 px-3">
                           <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border" style={{ color: inc.c, backgroundColor: `${inc.c}10`, borderColor: `${inc.c}30` }}>
                             {inc.severity}
                           </span>
                        </td>
                        <td className="py-2.5 px-3">
                           <div className="flex items-center gap-1.5">
                             <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ backgroundColor: inc.c }} />
                             <span className="text-xs text-slate-300">{inc.status}</span>
                           </div>
                        </td>
                        <td className="py-2.5 px-3">
                           <p className="text-xs text-slate-300 font-medium">{inc.officer}</p>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                           <button className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors border border-blue-500/20">
                             Manage Case
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}

export default ReportsAnalytics
