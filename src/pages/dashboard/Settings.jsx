import { Settings as SettingsIcon } from 'lucide-react'

export const Settings = () => {
  return (
    <div className="h-full flex gap-3">
      <div className="flex-1 flex flex-col min-w-0 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight mb-1">System Settings</h1>
            <p className="text-[11px] text-slate-400">Configure dashboard preferences and network settings</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
           <SettingsIcon className="w-12 h-12 mb-4 opacity-50" />
           <p className="text-sm font-bold">Settings Panel</p>
           <p className="text-xs">Configuration options will appear here.</p>
        </div>

      </div>
    </div>
  )
}

export default Settings
