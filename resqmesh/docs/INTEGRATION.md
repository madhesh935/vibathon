# ResQMesh Integration Guide

## System Flow

```
Victim Phone (Browser)
        │
        │ POST /relay  {victim_name, message, lat, lng}
        ▼
Raspberry Pi Relay Node (Flask :5000)
        │  SQLite local store + dedup
        │
        │ POST /api/report  {packet_id, victim_name, message, lat, lng}
        ▼
Backend (Node.js/Express :3001)
        │  Save to MongoDB
        │  io.emit('new-report', report)       ──► Dashboard updates live
        │
        │ HTTP POST /triage  {message}
        ▼
AI Service (Flask :5001 / Ollama qwen2.5:1.5b)
        │  Returns { priority, advice }
        │
        ▼
Backend updates report in MongoDB
        │  io.emit('priority-updated', ...)     ──► Dashboard + Victim App update
        │
Rescue Operator (Dashboard /dashboard)
        │  POST /api/respond  {report_id, response_message, status}
        ▼
Backend updates MongoDB
        │  io.emit('rescue-response', ...)      ──► Victim App shows response
        │  io.emit('status-updated', ...)
        ▼
Victim App shows response message ✅
```

---

## Socket.IO Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `new-report` | server → all | `report` object | New emergency submitted |
| `priority-updated` | server → all | `{ report_id, priority, advice, report }` | AI triage complete |
| `rescue-response` | server → all | `{ report_id, response, report }` | Operator sent response |
| `status-updated` | server → all | `{ report_id, status, report }` | Status changed |

### Victim App Filtering
The victim app connects to the backend and filters events by `report_id`:

```javascript
socket.on('rescue-response', ({ report_id, response }) => {
  if (report_id === myReportId) {
    showResponse(response);
  }
});
```

---

## REST API Reference

### POST /api/report
Submit a new emergency report.

**Body:**
```json
{
  "victim_name": "John",
  "message": "Trapped in basement, one person injured",
  "latitude": 12.843,
  "longitude": 80.153,
  "packet_id": "PKT-OPTIONAL"
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "_id": "...",
    "victim_name": "John",
    "status": "PENDING",
    "priority": "MEDIUM",
    ...
  }
}
```

---

### GET /api/reports
Get all reports (newest first, limit 200).

---

### GET /api/report/:id
Get a single report by MongoDB ID.

---

### POST /api/respond
Send a rescue response.

**Body:**
```json
{
  "report_id": "...",
  "response_message": "Medical team dispatched. ETA 15 minutes.",
  "status": "ASSIGNED"
}
```

---

### GET /api/statistics
```json
{
  "total": 12,
  "pending": 5,
  "assigned": 4,
  "resolved": 3,
  "critical": 2,
  "high": 3
}
```

---

## Relay Node API

### POST /relay
Receives victim report, stores locally, forwards to backend.

### GET /health
Returns relay status and backend connectivity.

### GET /packets
Lists all stored packets (for debugging).

---

## AI Service API

### POST /triage
**Body:** `{ "message": "Deep cut on arm, bleeding heavily" }`

**Response:** `{ "priority": "CRITICAL", "advice": "Apply direct pressure immediately" }`

### GET /health
Returns Ollama connectivity status.

---

## Demo Script (5 minutes)

1. **Open Dashboard** at http://localhost:3000/dashboard
   - Show the empty incident board
   - Point out live indicator (green dot = connected)

2. **Open Victim App** at http://localhost:3000 (simulate phone)
   - Allow GPS location
   - Enter: Name = "John Smith"
   - Message = "I am trapped in the library basement, one person has a deep cut on their arm"
   - Click **SEND SOS NOW**

3. **Watch Dashboard update in real time:**
   - New incident card appears immediately
   - After ~5 seconds, priority changes from MEDIUM to CRITICAL (AI triage)
   - AI advice appears: "Apply direct pressure to wound immediately"
   - Map marker appears at the GPS location

4. **Respond as rescue operator:**
   - Click the incident card
   - Type: "Medical team dispatched. ETA 10 minutes. Apply pressure to wound."
   - Click **Send Response**

5. **Show victim receiving the response:**
   - Victim App automatically shows the response
   - Status badge changes from ⏳ PENDING to 🚑 TEAM ASSIGNED

---

## Raspberry Pi Deployment

To deploy the relay node on a Raspberry Pi:

```bash
# On the Pi
git clone <repo>
cd resqmesh/relay-node
pip3 install -r requirements.txt

# Edit config.py — point to your backend IP
BACKEND_URL = "http://192.168.1.100:3001"  # laptop IP

python3 app.py
```

Update victim app `.env`:
```
VITE_RELAY_URL=http://192.168.1.x:5000   # Pi's IP on local WiFi
```

Victims connect to the Pi's local WiFi hotspot and access the app via the Pi's IP.
