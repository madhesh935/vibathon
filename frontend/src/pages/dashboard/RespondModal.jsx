import { useState } from 'react'
import { X, Send, AlertTriangle } from 'lucide-react'
import { sendResponse } from '../../services/api'

export const RespondModal = ({ incident, onClose, onSuccess }) => {
  const [response, setResponse] = useState('')
  const [status, setStatus]     = useState('ASSIGNED')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!response.trim()) {
      setError('Please provide a message for the victim.')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      await sendResponse(incident._id, response, status)
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to send response.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-[#1e293b]/50">
          <div>
            <h3 className="text-white font-bold text-base">Respond to Incident</h3>
            <p className="text-slate-400 text-xs mt-0.5">ID: {incident._id?.slice(-8).toUpperCase()} • {incident.victim_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">New Status</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              className="w-full bg-[#121822] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="PENDING">PENDING</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="EN_ROUTE">EN_ROUTE</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Message to Victim</label>
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="E.g., Team Alpha is en route, please stay calm."
              rows={4}
              className="w-full bg-[#121822] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting || !response.trim()}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              {submitting ? 'Sending...' : <><Send className="w-4 h-4"/> Send Response</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
