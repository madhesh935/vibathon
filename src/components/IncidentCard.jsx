import { MapPin, Clock, User, AlertTriangle, ChevronRight } from 'lucide-react'
import AlertBadge from './AlertBadge'

export const IncidentCard = ({ incident, onViewDetails, className = '' }) => {
  const priorityBorder = {
    CRITICAL: 'border-l-red-500',
    HIGH: 'border-l-orange-500',
    MEDIUM: 'border-l-yellow-500',
    LOW: 'border-l-green-500',
  }

  return (
    <div
      className={`
        bg-slate-900/80 border border-slate-700/50 border-l-4 rounded-xl p-4
        hover:border-slate-600 transition-all duration-200 cursor-pointer
        ${priorityBorder[incident.priority] || 'border-l-slate-500'}
        ${className}
      `}
      onClick={() => onViewDetails?.(incident)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-slate-400 text-xs font-mono">{incident.id}</span>
            <AlertBadge label={incident.priority} size="xs" />
            <AlertBadge label={incident.status} size="xs" />
          </div>
          <h4 className="text-white font-semibold text-sm truncate">{incident.victim || incident.victimName}</h4>
          <p className="text-slate-400 text-xs mt-0.5 truncate">
            <span className="capitalize">{incident.type}</span>
            {incident.description && ` · ${incident.description}`}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {incident.location && (
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <MapPin className="w-3 h-3" />
                {incident.location}
              </span>
            )}
            {incident.time && (
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <Clock className="w-3 h-3" />
                {incident.time}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </div>
      </div>
    </div>
  )
}

export default IncidentCard
