import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone, MapPin, Shield, Flame, Ambulance, Headphones,
  Heart, Building2, ChevronRight, Search, Bell,
  Navigation, Wifi, WifiOff, Radio, Users, Zap,
  Truck, Mail, ExternalLink, Send
} from 'lucide-react'
import { downloadPDF } from '../../utils/download'

const QUICK_DIAL = [
  { label:'Police',           num:'100',          Icon:Shield,      color:'#3b82f6', bg:'#eff6ff' },
  { label:'Fire Dept.',       num:'101',          Icon:Flame,       color:'#ef4444', bg:'#fef2f2' },
  { label:'Ambulance',        num:'108',          Icon:Ambulance,   color:'#10b981', bg:'#f0fdf4' },
  { label:'Disaster Helpline',num:'1078',         Icon:Headphones,  color:'#8b5cf6', bg:'#f5f3ff' },
  { label:'Relief Center',    num:'1800-123-456', Icon:Heart,       color:'#f97316', bg:'#fff7ed' },
  { label:'Disaster Hotline', num:'1919',         Icon:Bell,        color:'#ec4899', bg:'#fdf2f8' },
]

const NEARBY = [
  { name:'City Police Station',    dist:'0.9 km', avail:'24/7 Available', Icon:Shield,    color:'#3b82f6', avC:'#10b981' },
  { name:'Fire & Rescue Station',  dist:'1.1 km', avail:'24/7 Available', Icon:Flame,     color:'#ef4444', avC:'#10b981' },
  { name:'City General Hospital',  dist:'2.1 km', avail:'24/7 Available', Icon:Building2, color:'#10b981', avC:'#10b981' },
  { name:'Relief Camp A',          dist:'1.3 km', avail:'Capacity: 120',  Icon:Shield,    color:'#f59e0b', avC:'#3b82f6' },
  { name:'Emergency Control Room', dist:'1.0 km', avail:'24/7 Available', Icon:Headphones,color:'#8b5cf6', avC:'#10b981' },
]

const CATEGORIES = [
  { id:'all',      label:'All Contacts',       Icon:Users },
  { id:'govt',     label:'Government',         Icon:Building2 },
  { id:'health',   label:'Health Services',    Icon:Heart },
  { id:'disaster', label:'Disaster Management',Icon:Shield },
  { id:'utility',  label:'Utilities',          Icon:Zap },
  { id:'transport',label:'Transport',          Icon:Truck },
  { id:'ngo',      label:'NGOs & Volunteers',  Icon:Users },
]

const CONTACTS = [
  { name:'State Disaster Management Authority', abbr:'SDMA',  num:'011-2345-6789', avail:'24/7', purpose:'Disaster coordination & support',    cat:'disaster', Icon:Shield,    color:'#ef4444' },
  { name:'National Disaster Helpline',           abbr:'NDMA',  num:'1078',          avail:'24/7', purpose:'Disaster information & guidance',    cat:'disaster', Icon:Headphones,color:'#8b5cf6' },
  { name:'Red Cross Emergency Service',          abbr:'Indian Red Cross Society', num:'1800-425-5959', avail:'24/7', purpose:'Medical & humanitarian aid',  cat:'health',   Icon:Heart,     color:'#ef4444' },
  { name:'Electricity Board (TNEB)',             abbr:'Power Outage / Support',   num:'1912',          avail:'24/7', purpose:'Power failure & electrical issues', cat:'utility', Icon:Zap,    color:'#f59e0b' },
  { name:'Water Supply (Chennai Metro Water)',   abbr:'Water Supply Issues',      num:'155313',        avail:'6AM-10PM', purpose:'Water supply complaints',    cat:'utility', Icon:Building2, color:'#3b82f6' },
  { name:'Highways Emergency',                   abbr:'Road Block / Accident',    num:'1033',          avail:'24/7', purpose:'Road accidents & blockages',    cat:'transport',Icon:Truck,     color:'#10b981' },
]

const INFO_CARDS = [
  { label:'Share Your Location', desc:'Share your live location with emergency teams',  action:'Share Location',        Icon:Navigation, color:'#3b82f6', bg:'#eff6ff',  dark:false },
  { label:'Stay Safe',           desc:'Follow safety guidelines and stay updated',       action:'View Safety Guide',     Icon:Shield,     color:'#10b981', bg:'#f0fdf4',  dark:false },
  { label:'Offline Mode',        desc:'Save important contacts for offline access',      action:'Download Offline List', Icon:WifiOff,    color:'#f97316', bg:'#fff7ed',  dark:false },
]

export const EmergencyContacts = () => {
  const navigate  = useNavigate()
  const [cat,     setCat]     = useState('all')
  const [search,  setSearch]  = useState('')

  const call = (num) => { window.location.href = `tel:${num.replace(/[^0-9+]/g,'')}` }

  const filtered = CONTACTS.filter(c =>
    (cat === 'all' || c.cat === cat) &&
    (search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.num.includes(search))
  )

  const handleAction = (label) => {
    if (label === 'Offline Mode') {
      const text = "EMERGENCY CONTACTS\n\n" + CONTACTS.map(c => `${c.name} (${c.abbr || ''}): ${c.num}\nPurpose: ${c.purpose}`).join('\n\n')
      downloadPDF(text, 'Emergency_Contacts.pdf')
    } else if (label === 'Stay Safe') {
      navigate('/victim/safety')
    } else if (label === 'Share Your Location') {
      navigate('/victim/location')
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0d1117]">

      {/* ── Page control bar ─────────────────────────── */}
      <div className="flex-shrink-0 bg-[#0d1117] px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
        
        {/* Left: Quick Search */}
        <div className="flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts, services, or location..."
            className="flex-1 text-xs text-white bg-transparent outline-none placeholder-slate-500"/>
        </div>

        {/* Right: Request Callback Action */}
        <button onClick={() => navigate('/victim/report')}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-500 border-2 border-red-500/40 hover:border-red-500 hover:bg-red-500/10 transition-colors w-full sm:w-auto flex-shrink-0">
          <Phone className="w-3.5 h-3.5"/> Request Callback
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden scrollbar-none p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 lg:h-full lg:min-h-0">

        {/* ══ LEFT ══════════════════════════════════════════════ */}
        <div className="flex flex-col gap-5 lg:h-full lg:min-h-0">

          {/* Quick Dial */}
          <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden flex-shrink-0">
            <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-white font-bold text-base">Quick Dial</p>
              <p className="text-slate-400 text-xs mt-0.5">Tap to call any emergency service</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-5 py-4">
              {QUICK_DIAL.map(({ label, num, Icon, color, bg }) => (
                <button
                  key={label}
                  onClick={() => call(num)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/5 bg-slate-900/50 hover:border-red-500/30 hover:bg-red-500/10 hover:shadow-sm active:scale-98 transition-all duration-200 group text-center"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-sm"
                    style={{ background: `${color}15` }}>
                    <Icon className="w-6 h-6" style={{ color }}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold leading-tight truncate w-full">{label}</p>
                    <p className="text-slate-400 text-[10px] font-mono font-semibold mt-0.5">{num}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Can't call banner */}
            <div className="mx-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-slate-400"/>
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-semibold">Can't call right now?</p>
                  <p className="text-slate-400 text-xs mt-0.5">Send your location and alert to emergency teams</p>
                </div>
              </div>
              <button onClick={() => navigate('/victim/report')}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white flex-shrink-0 w-full sm:w-auto bg-red-600 hover:bg-red-700 transition-all duration-200"
                style={{ boxShadow:'0 2px 10px rgba(220,38,38,.1)' }}>
                <Send className="w-3.5 h-3.5"/> Send Emergency Alert
              </button>
            </div>
          </div>

          {/* Essential Contacts */}
          <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden min-h-[360px] lg:min-h-0 lg:flex-1 flex flex-col">
            <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-white font-bold text-base">Essential Contacts</p>
              <p className="text-slate-400 text-xs mt-0.5">Important departments and agencies</p>
            </div>
            <div className="flex flex-col md:flex-row flex-1 lg:min-h-0">

              {/* Category sidebar / horizontal pills */}
              <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible md:w-48 flex-shrink-0 py-2 gap-1 border-b md:border-b-0 md:border-r border-white/5 scrollbar-none px-4 md:px-0 lg:overflow-y-auto">
                {CATEGORIES.map(({ id, label, Icon:CIcon }) => {
                  const active = cat === id;
                  return (
                    <button key={id} onClick={() => setCat(id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        active 
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20 md:border-0 md:bg-red-500/10 md:font-extrabold' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                      } md:w-full md:rounded-none md:px-5 md:py-3 md:text-left`}>
                      <div className={`hidden md:block w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-red-500' : 'bg-transparent'}`}/>
                      <CIcon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-red-500' : 'text-slate-400'}`}/>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-hidden flex flex-col justify-between lg:min-h-0">
                <div className="p-4 md:p-5 space-y-3 max-h-[500px] lg:max-h-none overflow-y-auto scrollbar-none flex-1 lg:min-h-0">
                  {filtered.map(c => (
                    <div key={c.name} className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-white/10 hover:shadow-sm rounded-2xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background:`${c.color}12` }}>
                          <c.Icon className="w-4.5 h-4.5" style={{ color:c.color }} size={18}/>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-white text-sm font-bold leading-tight">{c.name}</p>
                            {c.abbr && (
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                {c.abbr}
                              </span>
                            )}
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              c.avail==='24/7' ? 'bg-emerald-950/30 text-emerald-400' : 'bg-amber-950/30 text-amber-400'
                            }`}>{c.avail}</span>
                          </div>
                          <p className="text-slate-400 text-[10px] font-mono font-bold mt-1.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400"/>
                            <span>{c.num}</span>
                          </p>
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{c.purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <button onClick={() => call(c.num)}
                          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-sm hover:opacity-90 bg-blue-600 hover:bg-blue-700">
                          <Phone className="w-3.5 h-3.5"/> Call Now
                        </button>
                        <button className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors bg-slate-900/50 border border-white/5">
                          <Mail className="w-4 h-4 text-slate-400"/>
                        </button>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm">No contacts found in this category.</div>
                  )}
                </div>
                <button className="w-full py-3.5 text-center text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5"
                  style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                  View All Contacts <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT ═════════════════════════════════════════════ */}
        <div className="flex flex-col gap-5 lg:h-full lg:min-h-0">

          {/* Emergency Services Nearby */}
          <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
            <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">Emergency Services Nearby</p>
                  <p className="text-slate-400 text-xs mt-0.5">Nearest emergency services from your location</p>
                </div>
                <button onClick={() => navigate('/victim/location')}
                  className="flex items-center gap-1 text-red-500 text-xs font-semibold hover:text-red-400">
                  View on Map <MapPin className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/5 lg:overflow-y-auto lg:flex-1 lg:min-h-0">
              {NEARBY.map(({ name, dist, avail, Icon:NIcon, color, avC }) => (
                <div key={name} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:`${color}12` }}>
                    <NIcon className="w-4.5 h-4.5" style={{ color }} size={18}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold">{name}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{dist} away</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background:`${avC}15`, color:avC }}>{avail}</span>
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-600/10 hover:bg-blue-600/20 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-blue-400"/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 overflow-hidden lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-white font-bold text-sm">Important Information</p>
            </div>
            <div className="p-3 space-y-2.5 lg:overflow-y-auto lg:flex-1 lg:min-h-0">
              {INFO_CARDS.map(({ label, desc, action, Icon:IIcon, color, bg, dark }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:`${color}15` }}>
                    <IIcon className="w-4.5 h-4.5" style={{ color }} size={18}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight text-white">{label}</p>
                    <p className="text-xs mt-1 leading-relaxed text-slate-400">{desc}</p>
                    <button onClick={() => handleAction(label)} className="text-[11px] font-bold mt-2.5 flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors cursor-pointer">
                      {action} <ChevronRight className="w-3 h-3"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  )
}

export default EmergencyContacts
