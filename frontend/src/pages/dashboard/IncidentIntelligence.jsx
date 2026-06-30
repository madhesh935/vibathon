import { useState } from 'react'
import { ChevronLeft, AlertTriangle, MessageSquare, CheckCircle2, Activity, Mic, Phone, Image, Zap, Brain, Ship, Cross } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const IncidentIntelligence = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="h-full flex p-4 gap-4" style={{ background: '#0a0d14' }}>
      
      <div className="flex-1 flex flex-col min-w-0 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Header Content */}
        <div className="p-5 border-b border-white/5 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(239,68,68,0.08) 0%, transparent 60%)' }} />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
             <button onClick={() => navigate('/dashboard/incidents')} className="text-[11px] text-blue-400 font-bold flex items-center gap-1 hover:text-blue-300">
               <ChevronLeft className="w-3.5 h-3.5" /> Back to Queue
             </button>
             <div className="flex items-center gap-3">
               <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Network<br/><span className="text-emerald-500">Online</span></div>
               <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> AI Engine<br/><span className="text-emerald-500">Active</span></div>
             </div>
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div>
               <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-2xl font-black text-white tracking-wide">REQ-{new Date().getFullYear()}-0615-0897</h2>
                 <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30 font-black uppercase tracking-wider">CRITICAL</span>
               </div>
               <p className="text-sm text-slate-300 font-bold mb-3">Flood Emergency</p>
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500 font-bold">Reported: <span className="text-slate-300">09:31 AM, {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span></p>
                 <p className="text-[10px] text-slate-500 font-bold">Source: <span className="text-slate-300">Mobile App</span></p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">AI Analysis</p>
                  <div className="flex items-center gap-1.5 justify-end">
                     <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                     <span className="text-[11px] text-red-500 font-bold">Critical Flood Risk</span>
                  </div>
               </div>
               <div className="h-10 w-px bg-white/10" />
               <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Confidence Score</p>
                  <p className="text-2xl font-black text-emerald-400">94% <span className="text-sm text-orange-500 ml-1 font-bold">2.4s</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 flex-shrink-0 px-2">
          {['Overview', 'AI Analysis', 'Resources', 'Communication', 'History'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab ? 'border-red-500 text-red-500' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
               
               {/* LEFT COL */}
               <div className="flex flex-col gap-6 border-r border-white/5 pr-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[11px] text-white font-bold uppercase tracking-wider">Location</p>
                    </div>
                    <div className="bg-[#121822] border border-white/5 rounded-xl p-4">
                       <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          <p className="text-sm font-mono text-blue-400 font-bold">12.97163, 77.59460</p>
                       </div>
                       <p className="text-xs text-slate-300 mb-2">Anna Nagar, Chennai, Tamil Nadu</p>
                       <p className="text-[10px] text-emerald-400 font-bold">Accuracy: &lt; 5m</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-white font-bold uppercase tracking-wider mb-3">Media & Evidence</p>
                    <div className="grid grid-cols-3 gap-3">
                       <div className="h-24 bg-slate-800 rounded-lg overflow-hidden border border-white/10 relative">
                         {/* Placeholder image representation */}
                         <div className="absolute inset-0 bg-blue-900/20" />
                         <span className="absolute bottom-1 right-1 text-[8px] bg-black/50 px-1 rounded text-white">09:31</span>
                       </div>
                       <div className="h-24 bg-slate-800 rounded-lg overflow-hidden border border-white/10 relative">
                         <div className="absolute inset-0 bg-blue-900/40" />
                         <span className="absolute bottom-1 right-1 text-[8px] bg-black/50 px-1 rounded text-white">09:32</span>
                       </div>
                       <div className="h-24 bg-slate-800 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-700">
                          <span className="text-[10px] text-slate-400">+ 2 more</span>
                       </div>
                    </div>
                  </div>

               </div>

               {/* RIGHT COL */}
               <div className="flex flex-col gap-6 pl-2">
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div>
                        <p className="text-[11px] text-white font-bold uppercase tracking-wider mb-3">Incident Details</p>
                        <div className="space-y-3">
                           <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-[11px] text-slate-500 font-bold">Type</span>
                              <span className="text-[11px] text-blue-400 font-bold">Flood</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-[11px] text-slate-500 font-bold">Severity</span>
                              <span className="text-[11px] text-red-500 font-bold">Critical</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-[11px] text-slate-500 font-bold">Victims</span>
                              <span className="text-[11px] text-white font-bold">4</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-[11px] text-slate-500 font-bold">Water Level</span>
                              <span className="text-[11px] text-red-400 font-bold">High</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-[11px] text-slate-500 font-bold">Area Impacted</span>
                              <span className="text-[11px] text-slate-300 font-bold">200m radius</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <div>
                           <p className="text-[11px] text-white font-bold uppercase tracking-wider mb-3">Victim Information</p>
                           <ul className="space-y-1">
                              <li className="text-[11px] text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500"/> 2 Adults, 2 Children</li>
                              <li className="text-[11px] text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500"/> Elderly person reported</li>
                           </ul>
                        </div>
                        <div>
                           <p className="text-[11px] text-white font-bold uppercase tracking-wider mb-3">Special Requirements</p>
                           <ul className="space-y-1">
                              <li className="text-[11px] text-blue-400 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"/> Boats needed</li>
                              <li className="text-[11px] text-emerald-400 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> Medical assistance required</li>
                           </ul>
                        </div>
                     </div>
                  </div>

                  <div>
                     <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] text-white font-bold uppercase tracking-wider">AI Risk Assessment</p>
                     </div>
                     <div className="bg-[#121822] border border-white/5 rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-end border-b border-white/5 pb-3">
                           <span className="text-[11px] text-slate-400 font-bold">Overall Risk Score</span>
                           <span className="text-xl font-black text-red-500">9.2<span className="text-[10px] text-slate-500">/10</span></span>
                        </div>
                        
                        <div className="space-y-3">
                           {[
                             { l: 'Victim Risk', v: 9.5, c: 'bg-red-500' },
                             { l: 'Environmental Risk', v: 8.8, c: 'bg-orange-500' },
                             { l: 'Accessibility Risk', v: 9.2, c: 'bg-red-500' },
                             { l: 'Time Sensitivity', v: 9.6, c: 'bg-red-500' },
                           ].map(r => (
                             <div key={r.l}>
                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                   <span className="text-slate-400">{r.l}</span>
                                   <span className="text-white">{r.v}</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                   <div className={`h-full ${r.c} rounded-full`} style={{ width: `${r.v * 10}%` }} />
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                           <p className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1.5"><AlertTriangle className="w-3 h-3"/> Immediate response required</p>
                           <p className="text-[11px] text-red-400 mt-1 font-bold">High risk to human life</p>
                        </div>
                     </div>
                  </div>

               </div>

            </div>
          )}
          {activeTab === 'AI Analysis' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                
                {/* AI Audio/Text Processing */}
                <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
                   
                   {/* Multimodal Analysis */}
                   <div className="bg-[#121822] border border-white/5 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                         <Activity className="w-32 h-32 text-purple-500" />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4 relative z-10">
                         <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Mic className="w-4 h-4 text-purple-400" />
                         </div>
                         <h3 className="text-sm font-bold text-white uppercase tracking-wider">Audio & Sentiment Analysis</h3>
                         <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-500/30">PROCESSED</span>
                      </div>

                      <div className="bg-[#0a0d14] rounded-lg p-4 border border-white/5 mb-4 relative z-10">
                         <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                               <Phone className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                               <p className="text-[11px] text-slate-400 mb-1 font-mono">09:31:02 AM - Audio Transcript Snippet</p>
                               <p className="text-sm text-white italic leading-relaxed">
                                  "Please help! The water is rising very fast, it's already up to our knees on the first floor. <span className="bg-red-500/30 text-red-200 px-1 rounded">My grandfather is here and he can't walk!</span> We need someone now, the <span className="bg-orange-500/30 text-orange-200 px-1 rounded">power just went out</span>."
                               </p>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 relative z-10">
                         <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Stress Level</p>
                            <p className="text-lg font-black text-red-400">92%</p>
                         </div>
                         <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Urgency</p>
                            <p className="text-lg font-black text-red-500">CRITICAL</p>
                         </div>
                         <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Keywords</p>
                            <p className="text-[11px] font-bold text-blue-400 leading-tight mt-1">Water rising<br/>Elderly</p>
                         </div>
                         <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Language</p>
                            <p className="text-[11px] font-bold text-slate-300 mt-2">English / Tamil</p>
                         </div>
                      </div>
                   </div>

                   {/* Computer Vision Analysis */}
                   <div className="bg-[#121822] border border-white/5 rounded-xl p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                         <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Image className="w-4 h-4 text-blue-400" />
                         </div>
                         <h3 className="text-sm font-bold text-white uppercase tracking-wider">Vision Intelligence (Drone Feed)</h3>
                         <span className="ml-auto text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold border border-blue-500/30">ANALYZING STREAM</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 flex-1">
                         <div className="bg-slate-900 rounded-lg relative overflow-hidden border border-white/10 group h-full min-h-[150px]">
                            <div className="absolute inset-0 bg-[#0f172a] opacity-80" />
                            {/* Bounding box mockups */}
                            <div className="absolute top-[20%] left-[30%] w-[40%] h-[50%] border-2 border-red-500 bg-red-500/10">
                               <span className="absolute -top-5 left-0 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5">Person 98%</span>
                            </div>
                            <div className="absolute bottom-[10%] left-[10%] w-[80%] h-[30%] border-2 border-blue-500 bg-blue-500/10">
                               <span className="absolute -top-5 left-0 bg-blue-500 text-white text-[8px] font-bold px-1 py-0.5">Water Level ~1.2m</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                               <p className="text-[10px] text-white font-bold">Drone Feed - Anna Nagar Sector 4</p>
                            </div>
                         </div>
                         <div className="flex flex-col gap-3">
                            <div className="bg-white/5 border border-white/5 p-3 rounded-lg flex-1">
                               <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Hazards Detected</span>
                               </div>
                               <ul className="space-y-2">
                                  <li className="flex items-start gap-2 text-[11px] text-red-400 font-bold leading-tight"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0"/> Flooded Roadway (Impassable for light vehicles)</li>
                                  <li className="flex items-start gap-2 text-[11px] text-orange-400 font-bold leading-tight"><Zap className="w-3 h-3 mt-0.5 shrink-0"/> Submerged Electrical Box Detected</li>
                               </ul>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-3 rounded-lg flex-shrink-0">
                               <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Structural Analysis</span>
                                  <span className="text-[10px] text-emerald-400 font-bold">Stable</span>
                               </div>
                               <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="w-[85%] h-full bg-emerald-500 rounded-full" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                </div>

                {/* Right Col: Predictive Models */}
                <div className="col-span-1 flex flex-col h-full">
                   <div className="bg-gradient-to-br from-[#121822] to-red-900/10 border border-red-500/20 rounded-xl p-5 flex-1 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -z-10" />
                      
                      <div className="flex items-center gap-2 mb-6">
                         <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-red-400" />
                         </div>
                         <h3 className="text-sm font-black text-white uppercase tracking-wider">Predictive Models</h3>
                      </div>

                      <div className="space-y-6 flex-1">
                         <div>
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Water Rise Projection</p>
                            <div className="h-28 bg-[#0a0d14] rounded-lg border border-white/5 p-3 flex items-end gap-1 overflow-hidden">
                               {/* Mock bar chart */}
                               {[20, 30, 45, 60, 85, 95].map((h, i) => (
                                 <div key={i} className="flex-1 bg-blue-500/50 hover:bg-blue-400 transition-colors rounded-t relative group" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-[9px] px-1 py-0.5 rounded text-white font-mono transition-opacity whitespace-nowrap z-10">
                                       +{h}cm
                                    </div>
                                 </div>
                               ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold text-right">+2ft expected in next 2 hrs</p>
                         </div>

                         <div>
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-3">Suggested Dispatch</p>
                            <div className="space-y-2">
                               <div className="bg-[#0a0d14] border border-white/5 rounded-lg p-3 flex justify-between items-center hover:border-blue-500/30 transition-colors cursor-pointer group">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        <Ship className="w-4 h-4 text-blue-400" />
                                     </div>
                                     <div>
                                        <p className="text-[11px] font-bold text-white">Rescue Boat (Zodiac)</p>
                                        <p className="text-[9px] text-slate-500">Draft &lt; 0.5m required</p>
                                     </div>
                                  </div>
                                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">MATCH: 98%</span>
                               </div>
                               <div className="bg-[#0a0d14] border border-white/5 rounded-lg p-3 flex justify-between items-center hover:border-emerald-500/30 transition-colors cursor-pointer group">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                        <Cross className="w-4 h-4 text-emerald-400" />
                                     </div>
                                     <div>
                                        <p className="text-[11px] font-bold text-white">Paramedic Unit</p>
                                        <p className="text-[9px] text-slate-500">Elderly care capabilities</p>
                                     </div>
                                  </div>
                                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">MATCH: 95%</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      <button className="w-full mt-auto bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] py-3.5 rounded-lg transition-colors uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                         Auto-Deploy Recommended Teams
                      </button>
                   </div>
                </div>

             </div>
          )}
          {!['Overview', 'AI Analysis'].includes(activeTab) && (
             <div className="h-full flex items-center justify-center">
                <p className="text-slate-500 text-sm">Content for {activeTab} will appear here.</p>
             </div>
          )}
        </div>

      </div>

    </div>
  )
}

export default IncidentIntelligence

function MapPin(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
}
