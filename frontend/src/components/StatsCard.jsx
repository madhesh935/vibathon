import { TrendingUp, TrendingDown } from 'lucide-react'

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  className = '',
}) => {
  const colorMap = {
    blue: { icon: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-blue-900/20' },
    red: { icon: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-red-900/20' },
    orange: { icon: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-orange-900/20' },
    green: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-900/20' },
    purple: { icon: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glow: 'shadow-purple-900/20' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div
      className={`
        bg-slate-900/80 border rounded-xl p-5 backdrop-blur-sm
        shadow-lg ${c.border} ${c.glow}
        hover:scale-[1.02] transition-transform duration-200
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">{title}</p>
          <p className={`text-3xl font-black ${c.icon}`}>{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <TrendingUp className="w-3 h-3 text-red-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-green-400" />
              )}
              <span className={`text-xs font-medium ${trend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {Math.abs(trend)}% {trendLabel}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${c.bg}`}>
            <Icon className={`w-6 h-6 ${c.icon}`} />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsCard
