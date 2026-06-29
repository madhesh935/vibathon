import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Siren, Activity, Radio, Cpu, Globe, ChevronRight, AlertTriangle } from 'lucide-react'
import { getStatistics } from '../services/api'
import { getRelayHealth } from '../services/api'

export const LandingPage = () => {
  const navigate = useNavigate()
  const [stats, setStats]       = useState(null)
  const [relayOk, setRelayOk]   = useState(null)
  const [backendOk, setBackendOk] = useState(null)
  const [clock, setClock]       = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    getStatistics()
      .then(r => { setStats(r.data); setBackendOk(true)  })
      .catch(() => setBackendOk(false))
    getRelayHealth()
      .then(() => setRelayOk(true))
      .catch(() => setRelayOk(false))
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-black text-xl tracking-tight">ResQMesh</span>
            <span className="text-red-400 text-xs ml-2 font-mono">v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-xs font-mono hidden md:block">
            {clock.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })}
          </span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            backendOk === null ? 'border-slate-700 text-slate-500' :
            backendOk ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              backendOk === null ? 'bg-slate-600 animate-pulse' :
              backendOk ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`} />
            {backendOk === null ? 'Checking…' : backendOk ? 'System Online' : 'Backend Offline'}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-5xl w-full">
          {/* Title */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              AI-Powered Disaster Response System
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-none">
              Res<span className="text-red-500">Q</span>Mesh
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Emergency communication and rescue coordination through a decentralized mesh relay network.
              Operates without internet infrastructure.
            </p>
          </div>

          {/* Portal cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            {/* Victim Portal */}
            <button
              onClick={() => navigate('/victim')}
              className="group bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-2xl p-8 text-left transition-all duration-300 hover:bg-red-500/5"
            >
              <div className="w-14 h-14 bg-red-500/15 border border-red-500/25 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-red-500/25 transition-colors">
                <Siren className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-white font-black text-xl mb-2">Victim Safety Portal</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Report an emergency, track your rescue team, communicate with operators, and receive AI safety guidance — all through mesh network.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Report Incident', 'Track Rescue', 'Mesh Chat', 'AI Guide'].map(t => (
                  <span key={t} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm group-hover:gap-3 transition-all">
                I Need Help <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Command Center */}
            <button
              onClick={() => navigate('/dashboard')}
              className="group bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-8 text-left transition-all duration-300 hover:bg-blue-500/5"
            >
              <div className="w-14 h-14 bg-blue-500/15 border border-blue-500/25 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-500/25 transition-colors">
                <Activity className="w-7 h-7 text-blue-400" />
              </div>
              <h2 className="text-white font-black text-xl mb-2">Rescue Command Center</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Monitor active incidents, coordinate rescue teams, view the live disaster map, and manage the ResQMesh network.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Situation Overview', 'Disaster Map', 'AI Triage', 'Team Dispatch'].map(t => (
                  <span key={t} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Open Command Center <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Live stats from API */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total SOS',       value: stats?.total    ?? '—', color: 'text-white'    },
              { label: 'Active Rescues',  value: stats?.assigned ?? '—', color: 'text-blue-400' },
              { label: 'Critical Cases',  value: stats?.critical ?? '—', color: 'text-red-400'  },
              { label: 'Resolved',        value: stats?.resolved ?? '—', color: 'text-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-slate-600 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between px-6 lg:px-12 py-4 border-t border-slate-800 gap-4">
        <div className="flex items-center gap-5 text-xs text-slate-700">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3" />
            Relay: <span className={relayOk ? 'text-emerald-500' : relayOk === null ? 'text-slate-600' : 'text-red-500'}>
              {relayOk === null ? 'Checking' : relayOk ? 'Online' : 'Offline'}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3" />
            AI Triage
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            No Internet Required
          </span>
        </div>
        <span className="text-slate-700 text-xs">ResQMesh © {new Date().getFullYear()} — Disaster Response Technology</span>
      </footer>
    </div>
  )
}

export default LandingPage
