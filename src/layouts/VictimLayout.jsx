import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Shield, Home, AlertCircle, Activity, MessageSquare,
  MapPin, Phone, BookOpen, Menu, Bell, ChevronDown,
  Radio, User, ChevronRight, Settings, Bot
} from 'lucide-react'
import { getRelayHealth } from '../services/api'

const navItems = [
  { to: '/victim',            icon: Home,        label: 'Dashboard',          end: true },
  { to: '/victim/report',     icon: AlertCircle, label: 'Report Emergency'              },
  { to: '/victim/status',     icon: Activity,    label: 'Rescue Status'                },
  { to: '/victim/assistant',  icon: Bot,         label: 'AI Assistant'                 },
  { to: '/victim/location',   icon: MapPin,      label: 'Location & Map'               },
  { to: '/victim/contacts',   icon: Phone,       label: 'Emergency Contacts'            },
  { to: '/victim/guide',      icon: BookOpen,    label: 'Safety Guide'                  },
]

export const VictimLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [relayOk,    setRelayOk]    = useState(null)
  const [clock,      setClock]      = useState(new Date())
  const [userName,   setUserName]   = useState(() => localStorage.getItem('resqmesh_user_name') || '')
  const navigate = useNavigate()

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Sync userName whenever localStorage changes (e.g., after SOS submission)
  useEffect(() => {
    const sync = () => setUserName(localStorage.getItem('resqmesh_user_name') || '')
    window.addEventListener('storage', sync)
    // Also poll every 2s for same-tab updates
    const t = setInterval(sync, 2000)
    return () => { window.removeEventListener('storage', sync); clearInterval(t) }
  }, [])

  useEffect(() => {
    const check = () => getRelayHealth().then(() => setRelayOk(true)).catch(() => setRelayOk(false))
    check()
    const t = setInterval(check, 20000)
    return () => clearInterval(t)
  }, [])

  const hour     = clock.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const relayStatus = relayOk === null ? 'checking' : relayOk ? 'connected' : 'offline'
  const displayName = userName.trim() || 'there'
  const firstName   = displayName.split(' ')[0]
  const initial     = firstName.charAt(0).toUpperCase() || '?'

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0d14] lg:p-4 lg:gap-4">
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)}/>}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-30 flex-shrink-0
        flex flex-col transition-all duration-300
        ${desktopOpen ? 'w-[220px]' : 'w-[60px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:rounded-2xl lg:overflow-hidden
      `} style={{ background:'#0d1117', borderRight:'1px solid rgba(255,255,255,0.04)' }}>

        {/* Brand */}
        <div 
          onClick={() => setDesktopOpen(!desktopOpen)}
          className={`flex items-center h-[56px] cursor-pointer hover:opacity-90 transition-opacity ${desktopOpen ? 'px-5' : 'justify-center'}`}
          style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow:'0 4px 14px rgba(220,38,38,.35)' }}>
              <Shield className="w-5 h-5 text-white"/>
            </div>
            {desktopOpen && (
              <div className="flex-shrink-0">
                <p className="text-white font-black text-sm leading-tight whitespace-nowrap">ResQMesh</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap" style={{ color:'#ef4444' }}>Identity Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-3 overflow-y-auto ${desktopOpen ? 'space-y-3 px-3' : 'space-y-4 px-1.5 flex flex-col items-center'}`}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center ${desktopOpen ? 'justify-start gap-3 px-3 py-2.5 w-full' : 'justify-center w-10 h-10'} rounded-xl transition-all duration-150 group relative ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { background:'#2c1216', border:'1px solid #dc2626', boxShadow:'inset 0 0 10px rgba(220,38,38,0.1)' } : { border: '1px solid transparent' }}>
              {({ isActive }) => (
                <>
                  <Icon className={`${desktopOpen ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0 ${isActive ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-300'}`}/>
                  {desktopOpen && (
                    <span className="text-xs font-semibold leading-none">{label}</span>
                  )}
                  {!desktopOpen && (
                    <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-[#090d16] text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-active:opacity-0 group-active:invisible transition-all whitespace-nowrap z-50 shadow-xl border border-white/10 pointer-events-none">
                      {label}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#090d16] rotate-45 border-l border-b border-white/10"></div>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:rounded-2xl lg:overflow-hidden lg:border lg:border-white/5 bg-[#0d1117] lg:shadow-xl">

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-[#0d1117]"
          style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', minHeight:'60px' }}>

          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg">
              <Menu className="w-5 h-5"/>
            </button>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{greeting}, {firstName} 👋</p>
              <p className="text-slate-400 text-xs mt-0.5">Stay safe, help is on the way.</p>
            </div>
          </div>
          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Time */}
            <div className="hidden lg:flex flex-col items-end mr-1.5">
              <p className="text-white text-xs font-bold font-mono leading-tight">
                {clock.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true }).toUpperCase()}
              </p>
              <p className="text-slate-400 text-[9px] mt-0.5 leading-none">
                {clock.toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
              </p>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-white rounded-xl transition-colors hover:bg-white/5">
              <Bell className="w-5 h-5"/>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="w-px h-6 bg-white/10 hidden sm:block"/>
            <button onClick={() => navigate('/victim/report')}
              className="flex items-center gap-1.5 text-white font-black text-sm px-4 py-2 rounded-xl transition-all active:scale-95 mr-1"
              style={{ background:'#dc2626', boxShadow:'0 2px 10px rgba(220,38,38,.35)' }}>
              <Phone className="w-4 h-4"/>
              <span>SOS</span>
            </button>
            <div className="flex items-center gap-2.5 p-1 pr-1.5 rounded-full hover:bg-white/5 transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-white text-xs font-bold leading-tight">{userName.trim() || 'Set Your Name'}</p>
                <p className="text-slate-400 text-[9px] font-semibold leading-none mt-0.5">Victim</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-sm"
                style={{ background:'linear-gradient(135deg,#dc2626,#7c3aed)' }}>{initial}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#0d1117]">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}

export default VictimLayout
