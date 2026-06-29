import { useState, useRef, useEffect } from 'react'
import { Send, Phone, MoreVertical } from 'lucide-react'

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-2">
    {[0, 1, 2].map((i) => (
      <span key={i} className={`typing-dot w-2 h-2 bg-slate-400 rounded-full`} />
    ))}
    <span className="text-slate-500 text-xs ml-2">typing...</span>
  </div>
)

const Message = ({ msg }) => {
  const isVictim = msg.sender === 'victim' || msg.sender === 'user'
  return (
    <div className={`flex ${isVictim ? 'justify-end' : 'justify-start'} mb-3 animate-slide-up`}>
      {!isVictim && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
          {msg.avatar || 'R'}
        </div>
      )}
      <div className={`max-w-[75%]`}>
        {!isVictim && (
          <p className="text-xs text-slate-500 mb-1 ml-1">{msg.senderName || 'Rescue Team'}</p>
        )}
        <div
          className={`
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${isVictim
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
            }
          `}
        >
          {msg.text || msg.message}
        </div>
        <p className={`text-xs text-slate-600 mt-1 ${isVictim ? 'text-right' : ''}`}>
          {msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isVictim && (
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold ml-2 flex-shrink-0 mt-1">
          {msg.avatar || 'V'}
        </div>
      )}
    </div>
  )
}

export const ChatBox = ({
  messages = [],
  onSend,
  senderRole = 'victim',
  connectedWith = 'Rescue Team',
  isTyping = false,
  className = '',
}) => {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return
    onSend?.({ text: input, sender: senderRole, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">R</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{connectedWith}</p>
            <p className="text-emerald-400 text-xs">Online • Secure Channel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-1" style={{ maxHeight: '400px', minHeight: '300px' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600 text-sm">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, i) => <Message key={i} msg={msg} />)
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
