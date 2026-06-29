import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'

const stepStatus = {
  completed: { icon: CheckCircle2, color: 'text-emerald-400', line: 'bg-emerald-400', label: 'Done' },
  active: { icon: Clock, color: 'text-blue-400', line: 'bg-blue-400', label: 'In Progress' },
  pending: { icon: Circle, color: 'text-slate-600', line: 'bg-slate-700', label: 'Pending' },
  error: { icon: AlertCircle, color: 'text-red-400', line: 'bg-red-400', label: 'Error' },
}

export const Timeline = ({ steps = [], className = '' }) => {
  return (
    <div className={`space-y-0 ${className}`}>
      {steps.map((step, i) => {
        const config = stepStatus[step.status] || stepStatus.pending
        const Icon = config.icon
        const isLast = i === steps.length - 1

        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`mt-1 ${config.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 min-h-[24px] ${config.line} opacity-40`} />
              )}
            </div>
            <div className={`pb-5 ${isLast ? '' : ''}`}>
              <p className={`text-sm font-semibold ${config.color}`}>{step.title}</p>
              {step.description && (
                <p className="text-slate-500 text-xs mt-0.5">{step.description}</p>
              )}
              {step.time && (
                <p className="text-slate-600 text-xs mt-1">{step.time}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Timeline
