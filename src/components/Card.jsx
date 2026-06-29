export const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  emergency = false,
  padding = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-900/80 border rounded-xl backdrop-blur-sm
        ${padding ? 'p-4' : ''}
        ${emergency ? 'border-red-500/50 shadow-lg shadow-red-900/20' : 'border-slate-700/50'}
        ${glow ? 'shadow-lg shadow-blue-900/20' : ''}
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        animate-fade-in
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ title, subtitle, icon: Icon, action, className = '' }) => (
  <div className={`flex items-start justify-between mb-4 ${className}`}>
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
      )}
      <div>
        <h3 className="text-white font-semibold">{title}</h3>
        {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
)

export const CardSection = ({ children, label, className = '' }) => (
  <div className={`mt-3 ${className}`}>
    {label && <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>}
    {children}
  </div>
)

export default Card
