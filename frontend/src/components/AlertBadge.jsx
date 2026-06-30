const configs = {
  CRITICAL: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/40',
    dot: 'bg-red-500',
    pulse: true,
  },
  HIGH: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/40',
    dot: 'bg-orange-500',
    pulse: false,
  },
  MEDIUM: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/40',
    dot: 'bg-yellow-500',
    pulse: false,
  },
  LOW: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/40',
    dot: 'bg-green-500',
    pulse: false,
  },
  ACTIVE: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    dot: 'bg-blue-500',
    pulse: true,
  },
  RESOLVED: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-500',
    pulse: false,
  },
  PENDING: {
    bg: 'bg-slate-500/20',
    text: 'text-slate-400',
    border: 'border-slate-500/40',
    dot: 'bg-slate-500',
    pulse: false,
  },
  ONLINE: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-500',
    pulse: true,
  },
  OFFLINE: {
    bg: 'bg-slate-600/20',
    text: 'text-slate-500',
    border: 'border-slate-600/40',
    dot: 'bg-slate-600',
    pulse: false,
  },
  BUSY: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    dot: 'bg-amber-500',
    pulse: false,
  },
}

export const AlertBadge = ({ label, size = 'sm', showDot = true, className = '' }) => {
  const key = label?.toUpperCase()
  const config = configs[key] || configs.PENDING

  const textSizes = { xs: 'text-xs px-1.5 py-0.5', sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-sm px-4 py-1.5' }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        border ${config.bg} ${config.text} ${config.border}
        ${textSizes[size]}
        ${className}
      `}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5">
          {config.pulse && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`} />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
        </span>
      )}
      {label}
    </span>
  )
}

export default AlertBadge
