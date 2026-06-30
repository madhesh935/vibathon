import { useState, useRef, useEffect } from 'react'
import { Bot, Sparkles, Send, Waves, Heart, Package, ArrowRight, ChevronDown } from 'lucide-react'
import { DUMMY } from '../../data/dummy'
import { chatWithAI } from '../../services/api'

const d = DUMMY.victim

/* ── Quick prompt chips ─────────────────────────────────────── */
const QUICK_PROMPTS = [
  'First Aid Tips', 'Flood Safety', 'Earthquake Safety', 'Fire Safety',
  'What to do during a flood?', 'How to treat a wound?',
]

/* ── Emergency guide cards ──────────────────────────────────── */
const GUIDES = [
  {
    icon: Waves, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)',
    title: 'Flood Safety', sub: 'Steps to stay safe',
    tip: 'Move to higher ground immediately. Avoid walking in floodwater.',
  },
  {
    icon: Heart, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)',
    title: 'First Aid', sub: 'Basic first aid steps',
    tip: 'Apply firm pressure to bleeding wounds. Keep the injured person still.',
  },
  {
    icon: Package, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)',
    title: 'Emergency Kit', sub: 'What to keep ready',
    tip: 'Water, first aid kit, flashlight, battery radio, emergency contacts.',
  },
  {
    icon: ArrowRight, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)',
    title: 'Evacuation Tips', sub: 'How to evacuate safely',
    tip: 'Follow official evacuation routes. Do not return until cleared.',
  },
]

/* ── AI response engine (cloud powered) ───────────────── */
/* ── Chat bubble ─────────────────────────────────────────────── */
const ChatBubble = ({ msg }) => (
  <div className={`flex gap-2.5 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
    {msg.from === 'ai' && (
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'rgba(139,92,246,0.2)', border: '1.5px solid rgba(139,92,246,0.4)' }}>
        <Bot className="w-3.5 h-3.5" style={{ color: '#c084fc' }} />
      </div>
    )}
    <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
      msg.from === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
    }`}
      style={msg.from === 'user'
        ? { background: '#dc2626', color: 'white' }
        : { background: '#1e2736', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' }
      }>
      {msg.text}
    </div>
  </div>
)

export const SafetyAssistant = () => {
  const firstName = (localStorage.getItem('resqmesh_user_name') || '').split(' ')[0] || 'there'
  const [messages, setMessages] = useState([{
    id: 1, from: 'ai',
    text: `Hello ${firstName}! I'm your AI safety assistant. I have access to local emergency guides and can answer your questions even in low-connectivity conditions.\n\nHow can I help you today?`
  }])
  const [input, setInput]       = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  const sendMessage = async (text = input) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), from: 'user', text: text.trim() }
    setMessages(p => [...p, userMsg])
    setInput('')
    setIsTyping(true)
    
    try {
      const res = await chatWithAI(text)
      setMessages(p => [...p, { id: Date.now() + 1, from: 'ai', text: res.data.response }])
    } catch {
      // Offline Fallback
      setMessages(p => [...p, { id: Date.now() + 1, from: 'ai', text: "I'm having trouble connecting to my systems right now. If this is a severe emergency, please call local emergency services immediately." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex h-full max-h-[calc(100vh-60px)]" style={{ background: '#0d1117' }}>

      {/* ── Left: Chat ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="px-4 py-3 flex-shrink-0"
          style={{ background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1.5px solid rgba(139,92,246,0.3)' }}>
              <Bot className="w-5 h-5" style={{ color: '#c084fc' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-sm leading-none">Safety Assistant</p>
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: '#4b5563' }}>AI-powered guidance for emergencies</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              Powered by Gemini
            </div>
          </div>
        </div>

        {/* Ask a Question header */}
        <div className="px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#374151' }}>Ask a Question</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.slice(0, 4).map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
          {isTyping && (
            <div className="flex gap-2.5 items-end">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1.5px solid rgba(139,92,246,0.4)' }}>
                <Bot className="w-3.5 h-3.5" style={{ color: '#c084fc' }} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: '#1e2736', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-1.5">
                  {[0, 0.2, 0.4].map(d => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-purple-400 typing-dot" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick prompt row */}
        <div className="px-4 py-2 flex-shrink-0 overflow-x-auto scrollbar-none"
          style={{ background: '#0d1117', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex gap-2">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="flex-shrink-0 text-[10px] px-3 py-1.5 rounded-full font-semibold transition-all"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)', whiteSpace: 'nowrap' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-3 flex-shrink-0"
          style={{ background: '#161b22', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your question..."
              className="flex-1 text-sm rounded-xl px-3 py-2.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#e2e8f0',
                outline: 'none',
              }}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim()}
              className="p-2.5 rounded-xl transition-all active:scale-95"
              style={{ background: '#7c3aed', color: 'white' }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Emergency Guides ───────────────────────────── */}
      <div className="w-72 flex-shrink-0 hidden lg:flex flex-col overflow-hidden"
        style={{ background: '#161b22', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Header */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white font-bold text-xs uppercase tracking-wide">Emergency Guides</p>
        </div>

        {/* Guide cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {GUIDES.map((g, i) => {
            const { icon: Icon, color, bg, border, title, sub, tip } = g
            const isOpen = expanded === i
            return (
              <div key={i} className="rounded-xl overflow-hidden transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  className="w-full flex items-center gap-3 p-3 text-left transition-all"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <Icon className="w-4.5 h-4.5" size={18} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-xs">{title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#4b5563' }}>{sub}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                    style={{ color: '#374151', transform: isOpen ? 'rotate(180deg)' : '' }} />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3">
                    <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{tip}</p>
                    <button
                      onClick={() => sendMessage(`Tell me more about ${title}`)}
                      className="text-[10px] font-bold mt-2 flex items-center gap-1 transition-all"
                      style={{ color }}>
                      View Guide →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* More tips button */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            More Tips ↓
          </button>
        </div>
      </div>
    </div>
  )
}

export default SafetyAssistant
