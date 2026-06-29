import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Search, Download, ChevronRight, Clock,
  AlertTriangle, CheckCircle2, Info, Waves, Flame,
  Wind, Heart, Users, Home, List, Radio,
  Zap, BookOpen, MapPin, Package
} from 'lucide-react'
import { downloadPDF } from '../../utils/download'

const CATEGORIES = [
  { id:'all',       label:'All Topics',     count:8  },
  { id:'flood',     label:'Flood Safety'             },
  { id:'earthquake',label:'Earthquake Safety'        },
  { id:'fire',      label:'Fire Safety'              },
  { id:'cyclone',   label:'Cyclone Safety'           },
  { id:'medical',   label:'Medical First Aid'        },
  { id:'shelter',   label:'Shelter Safety'           },
  { id:'general',   label:'General Safety'           },
]

const QUICK_ACCESS = [
  { label:'Emergency Checklist', sub:'Be prepared',      Icon:List,     color:'#3b82f6', bg:'#eff6ff' },
  { label:'Evacuation Guide',    sub:'What to do',        Icon:MapPin,   color:'#f97316', bg:'#fff7ed' },
  { label:'Family Safety Plan',  sub:'Prepare together',  Icon:Users,    color:'#10b981', bg:'#f0fdf4' },
  { label:'Emergency Kit',       sub:'What to include',   Icon:Package,  color:'#ec4899', bg:'#fdf2f8' },
  { label:'Child Safety Guide',  sub:'Keep kids safe',    Icon:Heart,    color:'#ef4444', bg:'#fef2f2' },
  { label:'Communication Tips',  sub:'Stay connected',    Icon:Radio,    color:'#8b5cf6', bg:'#f5f3ff' },
]

const TOPICS = [
  {
    id:'flood', cat:'flood',
    title:'Flood Safety',
    desc:'Stay safe before, during and after floods.',
    tips:10, mins:8, color:'#3b82f6', img:'🌊',
    grad:'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(59,130,246,0.02))',
  },
  {
    id:'earthquake', cat:'earthquake',
    title:'Earthquake Safety',
    desc:'What to do before, during and after an earthquake.',
    tips:11, mins:7, color:'#f59e0b', img:'🏚️',
    grad:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.02))',
  },
  {
    id:'fire', cat:'fire',
    title:'Fire Safety',
    desc:'Fire prevention and emergency response steps.',
    tips:10, mins:6, color:'#ef4444', img:'🔥',
    grad:'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.02))',
  },
  {
    id:'cyclone', cat:'cyclone',
    title:'Cyclone Safety',
    desc:'Stay safe during cyclones and storms.',
    tips:10, mins:7, color:'#8b5cf6', img:'🌀',
    grad:'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(139,92,246,0.02))',
  },
  {
    id:'firstaid', cat:'medical',
    title:'First Aid Guide',
    desc:'Basic first aid instructions for common injuries.',
    tips:15, mins:6, color:'#ec4899', img:'🩺',
    grad:'linear-gradient(135deg,rgba(236,72,153,0.1),rgba(236,72,153,0.02))',
  },
  {
    id:'evacuation', cat:'general',
    title:'Emergency Evacuation',
    desc:'How to evacuate safely and reach shelters.',
    tips:9, mins:5, color:'#10b981', img:'🚨',
    grad:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.02))',
  },
  {
    id:'shelter', cat:'shelter',
    title:'Shelter Safety',
    desc:'What to do in relief camps and shelters.',
    tips:8, mins:5, color:'#0ea5e9', img:'⛺',
    grad:'linear-gradient(135deg,rgba(14,165,233,0.1),rgba(14,165,233,0.02))',
  },
  {
    id:'general', cat:'general',
    title:'General Safety Tips',
    desc:'Essential everyday safety guidelines.',
    tips:16, mins:9, color:'#64748b', img:'🛡️',
    grad:'linear-gradient(135deg,rgba(100,116,139,0.1),rgba(100,116,139,0.02))',
  },
]

const ALERTS = [
  { type:'error',   icon:AlertTriangle, title:'Heavy Rain Alert',    sub:'Chennai & surrounding areas',      time:'2 min ago',  color:'#ef4444', bg:'#fef2f2', border:'#fecaca' },
  { type:'warning', icon:AlertTriangle, title:'High Tide Warning',    sub:'Marina Beach & Coastal areas',    time:'15 min ago', color:'#f97316', bg:'#fff7ed', border:'#fed7aa' },
  { type:'info',    icon:Info,          title:'Heat Advisory',         sub:'Temperature may reach 39°C',      time:'31 min ago', color:'#f59e0b', bg:'#fffbeb', border:'#fde68a' },
  { type:'safe',    icon:CheckCircle2,  title:'All Clear',             sub:'T. Nagar zone is safe',           time:'45 min ago', color:'#10b981', bg:'#f0fdf4', border:'#bbf7d0' },
]

const ESSENTIALS = [
  { label:'Water',      emoji:'💧' },
  { label:'First Aid Kit', emoji:'🩺' },
  { label:'Torch',      emoji:'🔦' },
  { label:'Power Bank', emoji:'🔋' },
  { label:'Whistle',    emoji:'📢' },
  { label:'Masks',      emoji:'😷' },
  { label:'Dry Food',   emoji:'🥫' },
  { label:'Radio',      emoji:'📻' },
]

const TopicDetail = ({ topic, onBack }) => (
  <div className="h-full overflow-y-auto scrollbar-none bg-[#0d1117]">
    <div className="max-w-2xl mx-auto p-5">
      <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden">
        <div className="h-40 flex items-center justify-center text-7xl"
          style={{ background: topic.grad }}>
          {topic.img}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background:`${topic.color}15`, color:topic.color }}>{topic.cat}</span>
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3"/> {topic.mins} min read
            </span>
          </div>
          <h2 className="text-white font-black text-2xl mb-2">{topic.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">{topic.desc}</p>
          <div className="space-y-3">
            {Array.from({ length: Math.min(topic.tips, 6) }, (_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background:`${topic.color}05`, border:`1px solid ${topic.color}15` }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background:topic.color }}>{i+1}</span>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {[
                    'Identify the nearest safe zone and evacuation route in advance.',
                    'Keep an emergency kit ready with essentials for at least 3 days.',
                    'Stay informed via official alerts and emergency broadcasts.',
                    'Help elderly and children first during any evacuation.',
                    'Do not return to the area until authorities declare it safe.',
                    'Document important documents in a waterproof container.',
                  ][i]}
                </p>
              </div>
            ))}
          </div>
          <button onClick={onBack}
            className="mt-5 w-full py-3 rounded-xl font-bold text-sm border border-white/5 bg-slate-900/50 text-slate-350 hover:bg-white/5 hover:text-white transition-colors">
            ← Back to Safety Guide
          </button>
        </div>
      </div>
    </div>
  </div>
)

const SafetyGuide = () => {
  const navigate  = useNavigate()
  const [cat,     setCat]   = useState('all')
  const [search,  setSearch]= useState('')
  const [open,    setOpen]  = useState(null)

  const filtered = TOPICS.filter(t =>
    (cat === 'all' || t.cat === cat) &&
    (search === '' || t.title.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDownload = () => {
    const text = TOPICS.map(t => `${t.title.toUpperCase()}\n${t.desc}\n\nTips:\n1. Identify safe zones\n2. Keep an emergency kit ready\n3. Stay informed via official alerts\n4. Help elderly and children first\n5. Do not return to the area until safe\n6. Document important documents`).join('\n\n' + '='.repeat(60) + '\n\n')
    downloadPDF(text, 'ResQMesh_Safety_Guide.pdf')
  }

  if (open) return <TopicDetail topic={open} onBack={() => setOpen(null)}/>

  return (
    <div className="h-full overflow-y-auto scrollbar-none bg-[#0d1117]">

      {/* ── Combined Tab bar and Search ──────────────── */}
      <div className="bg-[#0d1117] px-5 py-2 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-10"
        style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
        
        {/* Left: Category tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none w-full md:w-auto">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                cat===c.id ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}>
              {cat===c.id && c.count && (
                <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{c.count}</span>
              )}
              {c.label}
            </button>
          ))}
        </div>

        {/* Right: Search and Download */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-1.5 w-full md:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search guides..."
              className="flex-1 text-xs text-white bg-transparent outline-none placeholder-slate-500"/>
          </div>
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex-shrink-0 cursor-pointer">
            <Download className="w-3.5 h-3.5"/> PDF Guide
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-5 p-5">

        {/* ══ LEFT ══════════════════════════════════════ */}
        <div className="space-y-5">

          {/* Quick Access */}
          <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <p className="text-white font-bold text-sm">Quick Access</p>
                <p className="text-slate-400 text-xs">Get instant safety help</p>
              </div>
              <button className="text-red-500 text-xs font-semibold flex items-center gap-1 hover:text-red-400">
                View All Guides <ChevronRight className="w-3.5 h-3.5"/>
              </button>
            </div>
            <div className="grid grid-cols-6 gap-3 p-4">
              {QUICK_ACCESS.map(({ label, sub, Icon:QIcon, color, bg }) => (
                <button key={label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-slate-900/40 hover:border-red-500/30 hover:bg-red-500/10 hover:scale-105 transition-all active:scale-95 text-center group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-sm"
                    style={{ background: `${color}15` }}>
                    <QIcon className="w-5 h-5" style={{ color }}/>
                  </div>
                  <p className="text-white text-[10px] font-bold leading-tight">{label}</p>
                  <p className="text-slate-400 text-[9px]">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Safety Topics grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-bold text-sm">Safety Topics</p>
                <p className="text-slate-400 text-xs">Learn how to stay safe during emergencies</p>
              </div>
              <span className="text-slate-400 text-xs">{filtered.length} guides</span>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {filtered.map(t => (
                  <button key={t.id} onClick={() => setOpen(t)}
                    className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group">
                    {/* Illustration */}
                    <div className="h-28 flex items-center justify-center text-5xl"
                      style={{ background:t.grad }}>
                      {t.img}
                    </div>
                    <div className="p-3.5">
                      <h3 className="text-white font-bold text-sm leading-tight">{t.title}</h3>
                      <p className="text-slate-400 text-[10px] mt-1 leading-relaxed line-clamp-2">{t.desc}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="flex items-center gap-1 text-slate-400 text-[9px]">
                          <BookOpen className="w-3 h-3"/> {t.tips} Tips
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="flex items-center gap-1 text-slate-400 text-[9px]">
                          <Clock className="w-3 h-3"/> {t.mins} min read
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 font-semibold text-xs group-hover:gap-2 transition-all"
                        style={{ color:t.color }}>
                        Read Guide <ChevronRight className="w-3.5 h-3.5"/>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 py-16 text-center">
                <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3"/>
                <p className="text-slate-400 text-sm">No guides found for this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT ═════════════════════════════════════ */}
        <div className="space-y-5">

          {/* Safety Alerts */}
          <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <p className="text-white font-bold text-sm">Safety Alerts</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Live safety updates and warnings</p>
              </div>
              <button className="text-red-500 text-xs font-semibold hover:text-red-400">View All</button>
            </div>
            <div className="divide-y divide-white/5">
              {ALERTS.map(({ icon:AIcon, title, sub, time, color, bg, border }) => (
                <div key={title} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:`${color}15`, border:`1px solid ${color}30` }}>
                    <AIcon className="w-4 h-4" style={{ color }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold leading-tight">{title}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{sub}</p>
                  </div>
                  <p className="text-slate-400 text-[10px] flex-shrink-0 mt-0.5">{time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Essentials */}
          <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-4 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-white font-bold text-sm">Safety Essentials</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Must-have items during emergencies</p>
            </div>
            <div className="grid grid-cols-4 gap-2 p-4">
              {ESSENTIALS.map(({ label, emoji }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-900/50 hover:bg-slate-800 border border-white/5 rounded-xl transition-colors cursor-pointer">
                  <span className="text-2xl">{emoji}</span>
                  <p className="text-slate-300 text-[9px] font-semibold text-center leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Download prompt */}
          <div className="rounded-2xl p-4 text-white bg-gradient-to-br from-red-950/60 to-red-600/40 border border-red-500/20">
            <Shield className="w-6 h-6 text-red-300 mb-2"/>
            <p className="font-bold text-sm">Offline Safety Guide</p>
            <p className="text-red-200 text-xs mt-1 leading-relaxed">
              Download all guides for offline use during disasters when internet is unavailable.
            </p>
            <button onClick={handleDownload} className="mt-3 w-full py-2 rounded-xl bg-white text-red-900 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
              <Download className="w-3.5 h-3.5"/> Download All Guides
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SafetyGuide
