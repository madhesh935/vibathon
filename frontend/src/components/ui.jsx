import { PRIORITY_STYLES, STATUS_STYLES } from '../data/dummy'

// ── StatusBadge ────────────────────────────────────────────────
export const StatusBadge = ({ type = 'priority', value, pulse = false, size = 'sm' }) => {
  const styles = type === 'priority' ? PRIORITY_STYLES : STATUS_STYLES
  const s = styles[value] || styles.PENDING || styles.LOW
  const padding = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide ${padding} ${s.bg} ${s.text} border ${s.border}`}>
      {pulse && <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />}
      {s.label || value}
    </span>
  )
}

// ── LiveDot ────────────────────────────────────────────────────
export const LiveDot = ({ active = true, size = 'md' }) => {
  const sz = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
  return (
    <span className={`inline-block ${sz} rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
  )
}

// ── SectionHeader ──────────────────────────────────────────────
export const SectionHeader = ({ label, sub, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
    {action}
  </div>
)

// ── GlassPanel ─────────────────────────────────────────────────
export const GlassPanel = ({ children, className = '', hover = false }) => (
  <div className={`glass-panel rounded-2xl ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
)

// ── StatTile ───────────────────────────────────────────────────
export const StatTile = ({ label, value, sub, color = 'text-white', icon: Icon, pulse = false }) => (
  <div className="glass-panel rounded-xl p-3 flex items-center gap-3">
    {Icon && (
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        color.includes('red') ? 'bg-red-500/15' :
        color.includes('orange') ? 'bg-orange-500/15' :
        color.includes('emerald') || color.includes('green') ? 'bg-emerald-500/15' :
        'bg-blue-500/15'
      }`}>
        <Icon className={`w-4.5 h-4.5 ${color}`} size={18} />
      </div>
    )}
    <div className="min-w-0">
      <p className={`text-xl font-black leading-none ${color}`}>
        {value}
        {pulse && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current ml-1 animate-pulse align-middle" />}
      </p>
      <p className="text-slate-500 text-xs mt-0.5 truncate">{label}</p>
      {sub && <p className="text-slate-600 text-[10px] mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ── EmergencyButton ────────────────────────────────────────────
export const EmergencyButton = ({ label, icon: Icon, onClick, variant = 'danger', size = 'md', disabled = false, pulse = false }) => {
  const variants = {
    danger:   'bg-red-600 hover:bg-red-500 text-white shadow-glow-red border border-red-500/50',
    warning:  'bg-orange-600 hover:bg-orange-500 text-white shadow-glow-orange border border-orange-500/50',
    primary:  'bg-blue-600 hover:bg-blue-500 text-white shadow-glow-blue border border-blue-500/50',
    success:  'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-green border border-emerald-500/50',
    ghost:    'bg-white/5 hover:bg-white/10 text-white border border-white/10',
    outline:  'bg-transparent hover:bg-white/5 text-slate-300 border border-slate-700',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
    xl: 'px-8 py-4 text-lg gap-3 rounded-2xl',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-bold transition-all duration-200
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${pulse ? 'sos-pulse' : ''}
        ${variants[variant]} ${sizes[size]}
      `}
    >
      {Icon && <Icon size={size === 'xl' ? 22 : size === 'lg' ? 18 : size === 'sm' ? 14 : 16} />}
      {label}
    </button>
  )
}

// ── ProgressBar ────────────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color = 'blue', showLabel = false, height = 'h-1.5' }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const colors = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
    yellow: 'bg-amber-500',
    gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  }
  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${colors[color] || colors.blue} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="text-right text-xs text-slate-500 mt-0.5">{Math.round(pct)}%</p>}
    </div>
  )
}

// ── ResourceCard ───────────────────────────────────────────────
export const ResourceCard = ({ type, name, distance, available, icon: Icon }) => (
  <div className="flex items-center gap-3 p-3 glass-panel rounded-xl card-hover">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
      available ? 'bg-emerald-500/15' : 'bg-slate-700/50'
    }`}>
      {Icon && <Icon className={`w-4 h-4 ${available ? 'text-emerald-400' : 'text-slate-500'}`} />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-xs font-semibold truncate">{name}</p>
      <p className="text-slate-500 text-[10px]">{type} · {distance}</p>
    </div>
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
      available
        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/25'
        : 'text-slate-500 bg-slate-700/40 border border-slate-600/30'
    }`}>
      {available ? 'OPEN' : 'FULL'}
    </span>
  </div>
)

// ── SignalStrength ─────────────────────────────────────────────
export const SignalStrength = ({ value }) => {
  const bars = 4
  const active = Math.ceil((value / 100) * bars)
  const color = value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-end gap-0.5 h-4">
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className={`w-1 rounded-sm ${i < active ? color : 'bg-slate-700'}`}
          style={{ height: `${30 + i * 20}%` }}
        />
      ))}
    </div>
  )
}

// ── BatteryIcon ────────────────────────────────────────────────
export const BatteryIcon = ({ value }) => {
  const color = value >= 50 ? 'text-emerald-400' : value >= 20 ? 'text-amber-400' : 'text-red-400'
  const bg = value >= 50 ? 'bg-emerald-500' : value >= 20 ? 'bg-amber-500' : 'bg-red-500'
  const width = `${value}%`
  return (
    <div className="flex items-center gap-1">
      <div className="w-8 h-3.5 border border-slate-600 rounded-sm relative overflow-hidden">
        <div className={`absolute inset-y-0 left-0 ${bg} transition-all`} style={{ width }} />
        <div className="absolute right-0 inset-y-0 flex items-center pr-0.5">
          <div className="w-0.5 h-2 bg-slate-600 rounded-sm" />
        </div>
      </div>
      <span className={`text-[10px] font-mono font-bold ${color}`}>{value}%</span>
    </div>
  )
}
