import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Map, FileSearch, Users, Network,
  Menu, Bell, Clock, Activity, ChevronRight, BarChart3,
  Settings, Droplets, User, Cpu, Radio, ListChecks,
  Boxes, BrainCircuit
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard',              end: true },
  { to: '/dashboard/incidents', icon: ListChecks,      label: 'Incident Queue',         badge: '5' },
  { to: '/dashboard/map',       icon: Map,             label: 'Disaster Map'                         },
  { to: '/dashboard/teams',     icon: Users,           label: 'Rescue Operations'                    },
  { to: '/dashboard/resources', icon: Boxes,           label: 'Resource Management'                  },
  { to: '/dashboard/network',   icon: Network,         label: 'Network Intelligence'                 },
  { to: '/dashboard/reports',   icon: BarChart3,       label: 'Reports & Analytics'                  },
]

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [clock, setClock] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden lg:p-4 lg:gap-4" style={{ background: '#0a0d14' }}>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-30 flex-shrink-0
        flex flex-col transition-all duration-300
        ${desktopOpen ? 'w-[200px]' : 'w-[60px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:rounded-2xl lg:overflow-hidden
      `} style={{ background: '#0d1117', borderRight: '1px solid rgba(255,255,255,0.04)' }}>

        {/* Brand */}
        <div 
          onClick={() => setDesktopOpen(!desktopOpen)}
          className={`flex items-center h-[52px] cursor-pointer hover:opacity-80 transition-opacity ${desktopOpen ? 'px-4' : 'justify-center'}`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', boxShadow: '0 3px 8px rgba(220,38,38,0.2)' }}>
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            {desktopOpen && (
              <div className="flex-shrink-0">
                <p className="text-white font-black text-[13px] leading-tight tracking-wide whitespace-nowrap">ResQMesh</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap" style={{ color: '#ef4444' }}>Emergency Operations</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${desktopOpen ? 'space-y-2 px-3' : 'space-y-3.5 px-1.5 flex flex-col items-center'}`}>
          {navItems.map(({ to, icon: Icon, label, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center ${desktopOpen ? 'justify-start gap-3 px-3 py-2.5 w-full' : 'justify-center w-10 h-10'} rounded-lg transition-all duration-150 group relative ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { background: '#2c1216', border: '1px solid #dc2626', boxShadow: 'inset 0 0 10px rgba(220,38,38,0.1)' } : { border: '1px solid transparent' }}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`flex-shrink-0 ${desktopOpen ? 'w-4 h-4' : 'w-5 h-5'} ${isActive ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  
                  {desktopOpen && (
                    <>
                      <p className={`flex-1 text-xs font-semibold whitespace-nowrap ${isActive ? 'text-white' : ''}`}>{label}</p>
                      {badge && (
                        <div className="flex items-center bg-red-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          <span className="text-[9px] font-black text-white">{badge}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed mode */}
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

      {/* ── Right side: topbar + content ─────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:rounded-2xl lg:overflow-hidden lg:border lg:border-white/5 bg-[#0d1117] lg:shadow-xl">

        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-1.5 flex-shrink-0 z-30"
          style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)', minHeight: '52px' }}>

          {/* Left: Titles */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg">
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-sm leading-tight">ResQMesh Emergency Operations Center</h1>
              <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>Real-time monitoring • Intelligent Response • Safer Communities</p>
            </div>
          </div>

          {/* Right: Status & Profile */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Network Status */}
            <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Network className="w-3 h-3" style={{ color: '#34d399' }} />
              <div>
                <p className="text-[8px] uppercase tracking-wider" style={{ color: '#6b7280' }}>Network</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-bold" style={{ color: '#34d399' }}>Online</p>
                </div>
              </div>
            </div>

            {/* AI Engine */}
            <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Cpu className="w-3 h-3" style={{ color: '#34d399' }} />
              <div>
                <p className="text-[8px] uppercase tracking-wider" style={{ color: '#6b7280' }}>AI Engine</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-bold" style={{ color: '#34d399' }}>Active</p>
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="hidden lg:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <div>
                <p className="text-white text-[11px] font-bold font-mono">
                  {clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </p>
                <p className="text-[9px]" style={{ color: '#9ca3af' }}>
                  {clock.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}, {clock.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
              </div>
            </div>

            <div className="w-px h-6 bg-white/10 hidden lg:block" />

            {/* Profile - Polished with Stitch theme */}
            <div className="flex items-center gap-2.5 cursor-pointer group p-1 pr-2.5 rounded-full border border-transparent hover:border-blue-500/30 hover:bg-blue-500/10 transition-all duration-300">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white tracking-wide group-hover:text-blue-400 transition-colors">Cmdr. Ravi</p>
                <p className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest">Chaos Lead</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 group-hover:border-blue-500 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] flex items-center justify-center overflow-hidden transition-all duration-300">
                <img src="https://robohash.org/ravi?set=set2&bgset=bg1&size=150x150" alt="Ravi Profile" className="w-full h-full object-cover bg-slate-800" />
              </div>
            </div>

          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
