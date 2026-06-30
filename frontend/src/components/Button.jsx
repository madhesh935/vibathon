import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30',
  danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30',
  warning: 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-900/30',
  ghost: 'bg-transparent hover:bg-white/10 text-slate-300 border border-slate-600 hover:border-slate-400',
  outline: 'bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10',
  emergency: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-xl shadow-red-900/40',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded',
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-2.5 text-base rounded-lg',
  xl: 'px-8 py-3.5 text-lg rounded-xl',
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200 select-none cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
      {iconRight && !loading && <span className="ml-1">{iconRight}</span>}
    </button>
  )
}

export default Button
