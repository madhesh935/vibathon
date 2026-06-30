import { useState, useEffect, useRef } from 'react'
import { Bot, Send, Loader2 } from 'lucide-react'
import { triageMessage, chatWithAI } from '../../services/api'

const QUICK = [
  'What should I do during a flood?',
  'How do I stop heavy bleeding?',
  'First aid for earthquake injuries?',
  'How to signal for help?',
  'What to do if trapped in a building?',
  'CPR instructions',
]

const OFFLINE = {
  flood:     'Move to higher ground immediately. Avoid walking in moving water. Do not drive through flooded roads. Turn off utilities at main switches. Signal rescuers from a high point.',
  bleed:     'Apply firm, direct pressure with a clean cloth. Do not remove the cloth — add more if it soaks through. Elevate the limb above heart level if possible. Keep the person calm and still.',
  burn:      'Cool the burn under cold running water for at least 10 minutes. Do not use ice, butter, or toothpaste. Cover loosely with a clean bandage. Seek medical help for large or deep burns.',
  earthquake:'Drop, Cover, and Hold On. Get under a sturdy table. Stay away from windows. After shaking stops, check for injuries before moving. Watch for aftershocks.',
  trapped:   'Stay calm and conserve energy. Signal rescuers by tapping on pipes or walls. Cover your mouth to keep out dust. If you have a phone, call or text for help. Do not use open flames.',
  cpr:       'Check responsiveness. Call for help. Give 30 chest compressions (hard and fast, center of chest). Give 2 rescue breaths. Repeat until help arrives or person recovers.',
  default:   'Stay calm and assess your situation. If safe, call for help. Keep yourself and others warm and dry. Conserve phone battery for emergencies. Wait for rescue instructions.',
}

function offlineReply(q) {
  const lower = q.toLowerCase()
  if (lower.includes('flood') || lower.includes('water')) return OFFLINE.flood
  if (lower.includes('bleed') || lower.includes('blood') || lower.includes('wound')) return OFFLINE.bleed
  if (lower.includes('burn') || lower.includes('fire'))   return OFFLINE.burn
  if (lower.includes('earthquake') || lower.includes('quake') || lower.includes('tremor')) return OFFLINE.earthquake
  if (lower.includes('trapped') || lower.includes('stuck') || lower.includes('collapse')) return OFFLINE.trapped
  if (lower.includes('cpr') || lower.includes('heart') || lower.includes('breathing'))    return OFFLINE.cpr
  return OFFLINE.default
}

export const AIAssistant = () => {
  const [msgs, setMsgs]       = useState([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [aiOnline, setAiOnline] = useState(null)
  const bottomRef             = useRef(null)

  useEffect(() => {
    triageMessage('ping')
      .then(() => setAiOnline(true))
      .catch(() => setAiOnline(false))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = async (question) => {
    if (!question.trim() || loading) return
    setMsgs(p => [...p, { id: Date.now(), role: 'user', text: question }])
    setInput('')
    setLoading(true)
    try {
      const res = await chatWithAI(question)
      const text = res.data?.response || res.data?.advice || String(res.data)
      setAiOnline(true)
      setMsgs(p => [...p, { id: Date.now(), role: 'ai', text, online: true }])
    } catch {
      setAiOnline(false)
      const text = offlineReply(question)
      setMsgs(p => [...p, { id: Date.now(), role: 'ai', text, online: false }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0d1117]">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-white/5 bg-[#0d1117]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiOnline ? 'bg-purple-600 shadow-lg shadow-purple-500/20' : 'bg-slate-800 border border-white/10'}`}>
            <Bot className={`w-5 h-5 ${aiOnline ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">ResQ AI Assistant</p>
            <p className={`text-xs flex items-center gap-1 font-semibold ${aiOnline === null ? 'text-slate-400' : aiOnline ? 'text-purple-300' : 'text-amber-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${aiOnline === null ? 'bg-slate-400 animate-pulse' : aiOnline ? 'bg-purple-500 animate-pulse' : 'bg-amber-500'}`} />
              {aiOnline === null ? 'Checking…' : aiOnline ? 'AI Online — powered by Ollama' : 'Offline Mode — local guidance'}
            </p>
        </div>
      </div>
    </div>

      {/* Quick questions */}
      {msgs.length === 0 && (
        <div className="flex-shrink-0 px-5 pt-5 bg-[#0d1117]">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Quick Questions</p>
          <div className="flex flex-wrap gap-2">
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-xs bg-slate-900/60 border border-white/10 hover:border-purple-500 hover:bg-purple-500/10 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl transition-all shadow-sm">
                {q}
              </button>
            ))}
          </div>
          <div className="mt-6 text-center py-6 border-b border-white/5">
            <Bot className="w-12 h-12 text-slate-700 mx-auto mb-2 animate-bounce" style={{ animationDuration: '3s' }} />
            <p className="text-white text-sm font-bold">Ask me anything</p>
            <p className="text-slate-350 text-xs mt-1">Get immediate advice on first aid, evacuation safety, and emergency actions.</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0 bg-[#0a0d14]">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-2.5 flex-shrink-0 mt-0.5 shadow-sm ${m.online ? 'bg-purple-600 text-white' : 'bg-slate-800 border border-white/10 text-slate-400'}`}>
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[75%]`}>
              {m.role === 'ai' && !m.online && (
                <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wide mb-1 ml-1">Offline Guidance</p>
              )}
              {m.role === 'ai' && m.online && (
                <p className="text-purple-300 text-[10px] font-bold uppercase tracking-wide mb-1 ml-1">ResQ AI</p>
              )}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                m.role === 'user'
                  ? 'bg-red-600 border-red-700 text-white rounded-br-sm'
                  : 'bg-[#1e293b]/40 border-purple-500/20 text-slate-100 rounded-bl-sm'
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center mr-2.5 flex-shrink-0 mt-0.5 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#1e293b]/40 border border-purple-500/20 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-purple-450" />
                {aiOnline ? 'AI analyzing…' : 'Retrieving guidance…'}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-white/5 bg-[#0d1117]">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
            placeholder="Ask an emergency question…"
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:bg-slate-900 transition-colors"
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="w-12 h-12 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0 shadow-lg shadow-purple-500/20 disabled:shadow-none border border-white/5">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
