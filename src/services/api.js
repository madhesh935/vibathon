import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Network error'
    const status = err.response?.status ?? 0
    const error = new Error(msg)
    error.status = status
    return Promise.reject(error)
  }
)

// ─── Relay Node ──────────────────────────────────────────────────────────────

const RELAY_BASE = import.meta.env.VITE_RELAY_URL || 'http://localhost:5000'

/**
 * POST /relay
 * Submit an SOS via the offline/mesh relay node.
 */
export const submitViaRelay = (data) =>
  axios.post(`${RELAY_BASE}/relay`, {
    victim_name: data.victim_name || data.name,
    message: data.description || data.message,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
  })

// ─── Reports (maps to actual backend routes) ─────────────────────────────────

/**
 * POST /api/report
 * Submit a new SOS. Returns { success, report }.
 */
export const submitSOS = (data) =>
  api.post('/report', {
    victim_name: data.victim_name || data.name,
    message: data.description || data.message,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    packet_id: data.packet_id ?? undefined,
  })

/**
 * GET /api/reports
 * Returns array of all reports (newest first, max 200).
 */
export const getReports = () => api.get('/reports')

/**
 * GET /api/report/:id
 * Returns a single report object.
 */
export const getReport = (id) => api.get(`/report/${id}`)

/**
 * POST /api/respond
 * Operator sends rescue response + status update.
 */
export const sendResponse = (reportId, message, status = 'ASSIGNED') =>
  api.post('/respond', {
    report_id: reportId,
    response_message: message,
    status,
  })

/**
 * GET /api/statistics
 * Returns { total, pending, assigned, resolved, critical, high }.
 */
export const getStatistics = () => api.get('/statistics')

// ─── AI Triage (direct call to AI service) ────────────────────────────────────

const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:5001'

export const triageMessage = (message) =>
  axios.post(`${AI_BASE}/triage`, { message }, { timeout: 15000 })

export const chatWithAI = (message) =>
  axios.post(`${AI_BASE}/chat`, { message }, { timeout: 15000 })

// ─── Relay health ─────────────────────────────────────────────────────────────



export const getRelayHealth = () =>
  axios.get(`${RELAY_BASE}/health`, { timeout: 5000 })



// ─── AI Service (Text Enhancement) ───────────────────────────────────────────────────────────

export const enhanceText = (text) => {
  return axios.post(`${AI_BASE}/enhance`, { text }, { timeout: 30000 })
}

// ─── Speech Service ───────────────────────────────────────────────────────────

const SPEECH_BASE = import.meta.env.VITE_SPEECH_URL || 'http://localhost:5002'

export const transcribeAudio = (audioBlob) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'audio.webm')
  return axios.post(`${SPEECH_BASE}/transcribe`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
}

export default api
