import { useState, useRef, useEffect } from 'react'
import {
  Phone, Video, MapPin, Camera, Mic, Send,
  Shield, Paperclip, Wifi, Signal, CheckCheck
} from 'lucide-react'
import { DUMMY } from '../../data/dummy'

const d = DUMMY.victim

/* ── Initial messages ───────────────────────────────────────── */
const INITIAL_MSGS = d.rescueMessages

/* ── Message bubble ─────────────────────────────────────────── */
const Bubble = ({ msg }) => {
  const isVictim = msg.from === 'victim'
  const isSystem = msg.from === 'system'

  if (isSystem) return (
    <div className="flex justify-center my-1">
      <div className="px-3 py-1.5 rounded-full text-[10px] font-semibold"
        style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
        🔔 {msg.text}
      </div>
    </div>
  )

  return (
    <div className={`flex gap-2 ${isVictim ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {!isVictim && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
          style={{ background: 'rgba(59,130,246,0.2)', border: '1.5px solid rgba(59,130,246,0.3)' }}>
          <Shield className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
        </div>
      )}
      <div className={`max-w-[72%] flex flex-col ${isVictim ? 'items-end' : 'items-start'} gap-0.5`}>
        {!isVictim && msg.name && (
          <p className="text-[9px] px-1" style={{ color: '#4b5563' }}>{msg.name}</p>
        )}
        <div className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
          style={isVictim
            ? { background: '#dc2626', color: 'white', borderBottomRightRadius: 4 }
            : { background: '#1e2736', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 }
          }>
          {msg.text}
        </div>
        <div className={`flex items-center gap-1 px-1 ${isVictim ? 'flex-row-reverse' : ''}`}>
          <span className="text-[9px]" style={{ color: '#374151' }}>{msg.time}</span>
          {isVictim && <CheckCheck className="w-3 h-3" style={{ color: '#34d399' }} />}
        </div>
      </div>
    </div>
  )
}

/* ── Signal strength bars ────────────────────────────────────── */
const SignalBars = ({ strength = 4, max = 5, color = '#10b981' }) => (
  <div className="flex items-end gap-0.5 h-4">
    {Array.from({ length: max }, (_, i) => (
      <div key={i} className="w-1.5 rounded-sm"
        style={{ height: `${(i + 1) * 18}%`, background: i < strength ? color : 'rgba(255,255,255,0.1)' }} />
    ))}
  </div>
)

export const LiveChat = () => {
  const [messages, setMessages] = useState(INITIAL_MSGS)
  const [input, setInput]       = useState('')
  const [recording, setRecording] = useState(false)
  const [isTyping, setIsTyping]   = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  const sendMessage = () => {
    if (!input.trim()) return
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { id: Date.now(), from: 'victim', text: input.trim(), time: now }])
    setInput('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'rescue', name: 'Op. Ravi Kumar',
        text: 'Message received. Stay calm — we are monitoring your situation closely.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }])
    }, 1800)
  }

  return (
    <div className="flex h-full max-h-[calc(100vh-60px)]" style={{ background: '#0d1117' }}>

      {/* ── Left: Main chat ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.2)', border: '2px solid rgba(59,130,246,0.35)' }}>
                <Shield className="w-5 h-5" style={{ color: '#60a5fa' }} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{ background: '#10b981', borderColor: '#161b22' }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Team Rescue Alpha</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold" style={{ color: '#34d399' }}>Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a href={`tel:${d.team.contact}`}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex justify-center mb-3">
            <span className="text-[9px] px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#4b5563' }}>
              Today · {new Date().toLocaleDateString('en-IN')}
            </span>
          </div>
          {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
          {isTyping && (
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(59,130,246,0.2)', border: '1.5px solid rgba(59,130,246,0.3)' }}>
                <Shield className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: '#1e2736', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-1.5 items-center">
                  {[0, 0.2, 0.4].map(d => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 flex-shrink-0" style={{ background: '#161b22', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-end gap-2">
            <button className="p-2 rounded-xl transition-all flex-shrink-0" style={{ color: '#4b5563' }}>
              <Paperclip className="w-4.5 h-4.5" size={18} />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Type your message..."
                rows={1}
                className="w-full text-sm rounded-xl px-3 py-2.5 resize-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  outline: 'none',
                  minHeight: 42,
                  maxHeight: 100,
                }}
              />
            </div>
            <button
              onClick={() => setRecording(r => !r)}
              className="p-2 rounded-xl transition-all flex-shrink-0"
              style={recording
                ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
                : { color: '#4b5563' }
              }>
              <Mic className="w-4.5 h-4.5" size={18} />
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl transition-all flex-shrink-0 active:scale-95"
              style={{ background: '#dc2626', color: 'white' }}>
              <Send className="w-4.5 h-4.5" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Connection info + Quick Actions ─────────────── */}
      <div className="w-64 flex-shrink-0 flex flex-col overflow-hidden hidden lg:flex"
        style={{ background: '#161b22', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Connection Info */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white font-bold text-xs uppercase tracking-wide">Connection Info</p>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: 'Connection Type', value: 'Mesh Network', icon: Wifi, color: '#34d399' },
            { label: 'Signal Strength', value: 'Strong', custom: <SignalBars strength={4} />, icon: Signal, color: '#60a5fa' },
            { label: 'Messages Delivered', value: '100%', icon: CheckCheck, color: '#34d399' },
          ].map(({ label, value, icon: Icon, color, custom }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4b5563' }} />
                <p className="text-[10px] uppercase tracking-wide" style={{ color: '#4b5563' }}>{label}</p>
              </div>
              {custom
                ? <div className="flex items-center gap-2">
                    {custom}
                    <span className="text-xs font-bold" style={{ color }}>{value}</span>
                  </div>
                : <p className="text-sm font-bold" style={{ color }}>{value}</p>
              }
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white font-bold text-xs uppercase tracking-wide mb-3">Quick Actions</p>
          <div className="space-y-2">
            {[
              { icon: MapPin,  label: 'Send Location', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
              { icon: Camera,  label: 'Share Photo',   color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
              { icon: Mic,     label: 'Voice Message', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)' },
            ].map(({ icon: Icon, label, color, bg, border }) => (
              <button key={label}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: bg, color, border: `1px solid ${border}` }}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default LiveChat
