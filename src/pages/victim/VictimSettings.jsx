import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Bell, Lock, Shield, Info, Camera, Phone, Mail,
  MapPin, ToggleLeft, ToggleRight, Trash2, LogOut, ChevronRight, Check, Save
} from 'lucide-react'

const TABS = [
  { id:'profile',       label:'Profile'       },
  { id:'notifications', label:'Notifications' },
  { id:'privacy',       label:'Privacy'       },
  { id:'security',      label:'Security'      },
  { id:'about',         label:'About'         },
]

const Toggle = ({ value, onChange, color='#dc2626' }) => (
  <button onClick={() => onChange(!value)}
    className="relative w-10 h-6 rounded-full transition-all flex-shrink-0"
    style={{ background: value ? color : 'rgba(255,255,255,0.1)' }}>
    <span className="absolute top-1 left-1 transition-transform"
      style={{ transform: value ? 'translateX(16px)' : 'translateX(0)' }}>
      <span className="w-4 h-4 rounded-full bg-white shadow-sm block"/>
    </span>
  </button>
)

const PreferenceRow = ({ label, desc, value, onChange, color }) => (
  <div className="flex items-center justify-between py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
    <div>
      <p className="text-slate-200 text-sm font-semibold">{label}</p>
      <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
    </div>
    <Toggle value={value} onChange={onChange} color={color}/>
  </div>
)

export const VictimSettings = () => {
  const navigate = useNavigate()
  const [tab,   setTab]   = useState('profile')
  const [saved, setSaved] = useState(false)

  const [prefs, setPrefs] = useState({
    locationSharing: true,
    pushNotifications: true,
    emergencyAlerts: true,
    darkMode: false,
  })

  const [profile, setProfile] = useState({
    name:     localStorage.getItem('resqmesh_user_name') || 'Your Name',
    phone:    '+91 98765-43210',
    email:    'victim@resqmesh.in',
    location: 'Chennai, Tamil Nadu',
  })

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const handleSave = () => {
    localStorage.setItem('resqmesh_user_name', profile.name.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-none bg-[#0d1117]">

      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:'#0d1117' }}>
        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-0.5">Account</p>
        <h1 className="text-white font-black text-lg">Profile &amp; Settings</h1>
        <p className="text-slate-400 text-xs mt-0.5">Manage your account and preferences.</p>
      </div>

      {/* Tab strip */}
      <div className="px-4 flex gap-1 overflow-x-auto scrollbar-none" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:'#0d1117' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              tab===t.id ? 'border-red-500 text-red-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>{t.label}</button>
        ))}
      </div>

      <div className="max-w-lg mx-auto p-5 space-y-4">

        {/* ── Profile ─────────────────────────────────────── */}
        {tab === 'profile' && (
          <>
            <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <p className="text-white font-bold text-sm">Profile Information</p>
              </div>
              <div className="p-5">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl"
                      style={{ background:'linear-gradient(135deg,#dc2626,#991b1b)' }}>
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow-sm hover:bg-slate-700">
                      <Camera className="w-3 h-3 text-slate-400"/>
                    </button>
                  </div>
                  <div>
                    <p className="text-white font-bold">{profile.name}</p>
                    <button className="text-xs text-red-500 font-semibold mt-0.5 hover:text-red-400">
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Fields */}
                {[
                  { key:'name',     label:'Full Name',  Icon:User    },
                  { key:'phone',    label:'Phone',       Icon:Phone   },
                  { key:'email',    label:'Email',       Icon:Mail    },
                  { key:'location', label:'Location',    Icon:MapPin  },
                ].map(({ key, label, Icon }) => (
                  <div key={key} className="mb-3">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">{label}</label>
                    <div className="flex items-center gap-2.5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-red-500/50 transition-colors bg-slate-900/50">
                      <Icon className="w-4 h-4 text-slate-500 flex-shrink-0"/>
                      <input value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                        className="flex-1 text-sm text-white outline-none bg-transparent placeholder-slate-500" placeholder={label}/>
                    </div>
                  </div>
                ))}

                <button onClick={handleSave}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-98 flex items-center justify-center gap-2"
                  style={{ background:'#dc2626', boxShadow:'0 2px 12px rgba(220,38,38,.3)' }}>
                  {saved ? <><Check className="w-4 h-4"/> Saved!</> : <><Save className="w-4 h-4"/> Update Profile</>}
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-2xl border border-red-900/30 overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom:'1px solid rgba(239,68,68,0.1)' }}>
                <p className="text-red-400 font-bold text-sm">Danger Zone</p>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { label:'Clear Chat History', desc:'This will delete all your chat history.', icon:Trash2 },
                  { label:'Delete Account',     desc:'This action cannot be undone.',             icon:LogOut },
                ].map(({ label, desc, icon: Icon }) => (
                  <button key={label}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-500/5 transition-colors group">
                    <div className="flex items-center gap-3 text-left">
                      <Icon className="w-4 h-4 text-red-400 flex-shrink-0"/>
                      <div>
                        <p className="text-slate-300 text-sm font-semibold">{label}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors"/>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Notifications ─────────────────────────────── */}
        {tab === 'notifications' && (
          <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-white font-bold text-sm">App Preferences</p>
            </div>
            <div className="px-5">
              <PreferenceRow
                label="Location Sharing"    desc="Share your live location"
                value={prefs.locationSharing}    onChange={() => toggle('locationSharing')}    color="#3b82f6"/>
              <PreferenceRow
                label="Push Notifications"  desc="Receive important updates"
                value={prefs.pushNotifications}  onChange={() => toggle('pushNotifications')}  color="#dc2626"/>
              <PreferenceRow
                label="Emergency Alerts"    desc="Receive critical alerts"
                value={prefs.emergencyAlerts}    onChange={() => toggle('emergencyAlerts')}    color="#ef4444"/>
              <PreferenceRow
                label="Dark Mode"           desc="Use dark theme"
                value={prefs.darkMode}           onChange={() => toggle('darkMode')}           color="#6366f1"/>
            </div>
          </div>
        )}

        {/* ── Privacy ───────────────────────────────────── */}
        {tab === 'privacy' && (
          <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 space-y-3">
            <p className="text-white font-bold text-sm">Privacy Settings</p>
            {[
              { label:'Profile Visibility',   desc:'Who can see your profile' },
              { label:'Location History',     desc:'Store your location history' },
              { label:'Data Analytics',       desc:'Allow anonymous usage data' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <p className="text-slate-200 text-sm font-semibold">{label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
                <Toggle value={true} onChange={() => {}} color="#3b82f6"/>
              </div>
            ))}
          </div>
        )}

        {/* ── Security ──────────────────────────────────── */}
        {tab === 'security' && (
          <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-white font-bold text-sm">Security</p>
            </div>
            {[
              { label:'Change Password',       desc:'Update your password',           Icon:Lock    },
              { label:'Two-Factor Auth',        desc:'Add an extra layer of security', Icon:Shield  },
              { label:'Active Sessions',        desc:'Manage signed-in devices',       Icon:User    },
            ].map(({ label, desc, Icon }) => (
              <button key={label}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5 group">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-400"/>
                  </div>
                  <div>
                    <p className="text-slate-200 text-sm font-semibold">{label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400"/>
              </button>
            ))}
          </div>
        )}

        {/* ── About ─────────────────────────────────────── */}
        {tab === 'about' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3"
                style={{ background:'linear-gradient(135deg,#dc2626,#991b1b)' }}>
                <Shield className="w-8 h-8 text-white"/>
              </div>
              <p className="text-slate-800 font-black text-xl">ResQMesh</p>
              <p className="text-red-500 text-xs font-bold uppercase tracking-widest mt-0.5">Victim Portal</p>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                A disaster response platform connecting victims with rescue teams in real-time.
              </p>
            </div>
            <div className="border-t border-slate-100 pt-4 space-y-2">
              {[
                ['Version', 'v2.4.0'],
                ['Build',   new Date().toISOString().split('T')[0].replace(/-/g, '.')],
                ['Support', 'support@resqmesh.in'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">{k}</p>
                  <p className="text-slate-700 text-sm font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VictimSettings
