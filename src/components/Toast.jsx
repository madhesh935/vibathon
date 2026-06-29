import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const configs = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-900/80 border-emerald-500/40',
    icon_color: 'text-emerald-400',
    title_color: 'text-emerald-300',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-900/80 border-red-500/40',
    icon_color: 'text-red-400',
    title_color: 'text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-orange-900/80 border-orange-500/40',
    icon_color: 'text-orange-400',
    title_color: 'text-orange-300',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-900/80 border-blue-500/40',
    icon_color: 'text-blue-400',
    title_color: 'text-blue-300',
  },
}

const ToastItem = ({ toast, onDismiss }) => {
  const config = configs[toast.type] || configs.info
  const Icon = config.icon

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
        shadow-2xl min-w-[300px] max-w-[400px]
        toast-enter
        ${config.bg}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.icon_color}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold ${config.title_color}`}>{toast.title}</p>
        )}
        {toast.message && (
          <p className="text-slate-300 text-xs mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts?.length) return null
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export default ToastContainer
