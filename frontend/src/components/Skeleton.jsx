export const Skeleton = ({ className = '', lines = 1 }) => {
  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-3 bg-slate-700/60 rounded animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    )
  }
  return <div className={`bg-slate-700/60 rounded animate-pulse ${className}`} />
}

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-slate-900/80 border border-slate-700/40 rounded-2xl p-5 space-y-4 ${className}`}>
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
    <Skeleton lines={3} />
  </div>
)

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-slate-900/80 border border-slate-700/40 rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
)

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl overflow-hidden">
    <div className="bg-slate-800/30 px-4 py-3 grid grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-2.5" />)}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="px-4 py-3.5 grid grid-cols-6 gap-4 border-t border-slate-700/30">
        {[...Array(6)].map((_, j) => <Skeleton key={j} className="h-3" />)}
      </div>
    ))}
  </div>
)

export default Skeleton
