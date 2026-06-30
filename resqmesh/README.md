# ResQMesh 🆘

**Resilient, Offline-First Disaster Response Communication & Triage Infrastructure**

ResQMesh is a multi-tier, offline-first communication and emergency management infrastructure designed to coordinate rescue efforts in extreme environments where internet connectivity and cellular networks are completely compromised. 

---

## 🎯 The Problem

During natural disasters (hurricanes, earthquakes, floods, wildfires), primary communication infrastructure (cellular towers, fiber backhauls, power grids) is often damaged or overloaded. As a result:
- **Victims** are left isolated, unable to signal for rescue or relay vital metadata (GPS location, health status).
- **First Responders** operate in information vacuums, lacking real-time casualty assessment, priority filters, and unified location tracking.
- **Rescue Operations** are slowed by unstructured, unverified emergency signals and a lack of intelligent sorting.

## 💡 The ResQMesh Solution

ResQMesh solves this by providing a multi-tiered communication bridge using local mesh nodes, offline databases, and edge AI services:

1. **Local Edge Relays**: Custom hotspots (e.g., Raspberry Pi edge nodes) run a local Flask service that buffers victim SOS requests in a SQLite store.
2. **Store-and-Forward Sync**: Edge nodes buffer incoming SOS packets and automatically forward them to the central backend using a reliable queue once an internet connection (satellite backhaul, cellular relay, or drone uplink) becomes available.
3. **100% Offline AI Triage**: An offline intelligence service powered by local Large Language Models (Ollama with `qwen2.5:1.5b`) parses unstructured emergency distress messages, assigns priority levels (CRITICAL, HIGH, MEDIUM, LOW), and provides immediate first-aid guidance.
4. **Command & Control Dashboard**: A real-time incident command center for operators to dispatch units, map casualties dynamically, track response progress, and chat with victims.

---

## 🏗️ System Architecture

```text
       ┌────────────────────────┐
       │ Victim Device (Mobile) │
       └───────────┬────────────┘
                   │
                   │ POST /relay (SOS Data + Telemetry)
                   ▼
       ┌────────────────────────┐
       │  Relay Node (Flask)    │  ◄── Deployable on Raspberry Pi / Local Hotspot
       │  - SQLite Local DB     │
       │  - Buffer & Retry      │
       └───────────┬────────────┘
                   │
                   │ POST /api/report (Upon Network Restoration)
                   ▼
       ┌────────────────────────┐
       │ Central API Backend    │
       │  (Node.js / Express)   │
       └───────────┬────────────┘
         ▲         │          ▲
         │         │          │
         │ Socket  │ POST     │ Socket.IO
         │ .IO     │ /triage  │
         │         ▼          │
         │   ┌──────────┐     │   ┌──────────────────────────────┐
         │   │  AI Node │     └───┤ Command Dashboard (React)    │
         │   │ (Ollama) │         │ - Real-time Incident Map     │
         │   └──────────┘         │ - Live Dispatch Queue        │
         │                        │ - Operator Chat Console      │
         │                        └──────────────────────────────┘
         ▼
┌────────────────────────┐
│ Victim Live Status     │  ◄── Visual status timeline & ETA updates
│ (React Mobile Client)  │
└────────────────────────┘
```

---

## 🔌 Port & Service Map

| Service | Protocol / Tech | Default Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Server** | React / Vite | `3000` | Serves the Victim Portal and Command Dashboard client |
| **Central Backend** | Node.js / Express | `3001` | Core REST API, WebSockets (Socket.IO), and MongoDB connector |
| **Relay Node** | Python Flask | `5000` | Edge device receiver (utilizes SQLite for offline buffering) |
| **AI Triage Node** | Python Flask | `5001` | Local Ollama bridge for LLM-based emergency classification |
| **Speech-to-Text Node**| Python Flask | `5002` | Optional Faster-Whisper interface for voice-to-text SOS inputs |
| **Database (Central)** | MongoDB | `27017` | Central data store for persistent incident records |
| **LLM Inference Server**| Ollama | `11434` | Backend engine hosting local LLM weights |

---

## ✨ Features

- **Offline-First Victim Portal**: Optimized for mobile, enabling citizens to request aid, transmit automatic GPS coordinates, view visual status timelines, and access offline emergency guides.
- **Store-and-Forward Protocol**: Ensures telemetry integrity. If the central command network is unreachable, packets are safely queued in SQLite and retried periodically.
- **Offline Intelligence Engine**: Uses Ollama with lightweight LLM weights (`qwen2.5:1.5b`) to evaluate messages locally, extracting medical needs, trap conditions, and severity rankings without cloud dependencies.
- **Real-Time Operator Command Center**: A leaflet-based geographic visualization system showing incident sites, live websocket-based chat, critical-priority alerts, and responsive status controls.
- **Real-Time WebSockets Sync**: Propagates dispatch status updates, response messages, and ETA timelines back to victims instantaneously.

---

## 🛠️ Tech Stack

- **Client Application**: React 18, React Router v6, Vanilla CSS, Lucide Icons, Leaflet Maps
- **Central APIs**: Node.js, Express, Socket.IO, Mongoose
- **Databases**: MongoDB (Central Command), SQLite 3 (Edge Relays)
- **Edge Layer**: Python 3.10+, Flask, SQLite3, Requests
- **Intelligence Layer**: Ollama, `qwen2.5:1.5b` (Ollama local inference)

---

## 🚀 Environment Initialization (Windows Server Setup)

### Prerequisites
1. **Node.js (v18+)**
2. **Python (3.10+)**
3. **MongoDB Community Server** (Installed and running on port `27017`)
4. **Ollama** (Installed locally from [ollama.ai](https://ollama.ai))

---

### Step 1: Model Provisioning
1. Ensure Ollama is running (`ollama serve` or open the Ollama desktop application).
2. Download the lightweight inference model:
   ```powershell
   ollama pull qwen2.5:1.5b
   ```

### Step 2: System Orchestration
We have included a startup script to verify prerequisites and automatically run the components (Frontend, Central Backend, Edge Relay, and AI Triage Server).

Execute the orchestrator from a PowerShell console:
```powershell
cd resqmesh
.\start-demo.ps1
```
*(The startup orchestrator checks for Node and Python packages, performs initial dependency installs, and starts each service in a background context.)*

### Step 3: Accessing the Applications
- **Victim Telemetry Portal**: [http://localhost:3000](http://localhost:3000)
- **Incident Command Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 📝 Manual Component Setup

If you prefer to manually manage and deploy individual components:

### 1. Central Backend (Node.js)
```bash
cd resqmesh/backend
cp .env.example .env
npm install
npm run dev
```
*Configurable in `backend/.env`:*
- `PORT` (Default: `3001`)
- `MONGO_URI` (Default: `mongodb://localhost:27017/resqmesh`)
- `AI_SERVICE_URL` (Default: `http://localhost:5001`)

### 2. AI Triage Node (Flask + Ollama)
```bash
cd resqmesh/ai-service
pip install -r requirements.txt
python app.py
```
*Expects Ollama running locally. Connects to `http://localhost:11434`.*

### 3. Edge Relay Node (Flask + SQLite)
```bash
cd resqmesh/relay-node
pip install -r requirements.txt
python app.py
```
*Creates `relay.db` locally. Forwards payloads to backend at `http://localhost:3001`.*

### 4. Client Web Application (React + Vite)
```bash
cd resqmesh/frontend
cp .env.example .env
npm install
npm run dev
```
*Configurable in `frontend/.env`:*
- `VITE_RELAY_URL` (URL of your local Relay Node, e.g., `http://localhost:5000`)
- `VITE_BACKEND_URL` (URL of central command API, e.g., `http://localhost:3001`)

---

## 📡 API Specifications & System Integration

### Endpoint: `POST /relay` (Edge Node Intake)
Used by victim clients connected to the edge hotspot.
- **Request Body**:
  ```json
  {
    "victim_name": "Sarah Connor",
    "message": "Trapped upstairs due to flooding, rising water level.",
    "latitude": 34.0522,
    "longitude": -118.2437
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "packet_id": "8f8b8a5d-4f11-477a-b9c1-4f12eb60ad41",
    "status": "BUFFERED"
  }
  ```

### Endpoint: `POST /triage` (AI Analysis)
Used internally by the backend to categorize emergencies.
- **Request Body**:
  ```json
  {
    "message": "Heavy bleeding from leg injury, needs medical help."
  }
  ```
- **Response**:
  ```json
  {
    "priority": "CRITICAL",
    "advice": "Apply pressure to the wound, elevate the leg, and keep warm. Prepare tourniquet if bleeding doesn't slow."
  }
  ```

### Endpoint: `POST /api/respond` (Command Dispatch Response)
Invoked by operators to send telemetry updates back to the victim.
- **Request Body**:
  ```json
  {
    "report_id": "64d0e95c102a3a5f80b91e92",
    "response_message": "Rescue Team Bravo dispatched with an amphibious vehicle. ETA 15 minutes.",
    "status": "ASSIGNED"
  }
  ```

---

## 🛜 Hardware & Field Deployment Guide

To deploy ResQMesh in an active crisis theater:
1. **Prepare Hardware**: Provision a Raspberry Pi 4 or similar Single Board Computer (SBC) running Raspberry Pi OS.
2. **Configure Wi-Fi Hotspot**: Configure the Pi to run a captive portal Wi-Fi network (e.g., using `hostapd` and `dnsmasq`) named `ResQMesh_SOS`.
3. **Install Relay Client**: Clone the repository onto the Pi, navigate to `/relay-node`, configure it to auto-run on boot, and bind the server to `0.0.0.0:5000`.
4. **Captive Routing**: Set DNS tables so all incoming traffic redirects to the local React frontend hosted on the Pi.
5. **Connectivity Links**: Once a connection is established (via a satellite transceiver, LTE dongle, or drone mesh link), the Relay Node automatically flushes its queue to the Command Backend.

---

## 📚 Related Documentation

- Detailed APIs, endpoints, and data formats are fully described in [docs/INTEGRATION.md](file:///c:/Users/madhesh/OneDrive/Desktop/qvac/resqmesh/docs/INTEGRATION.md).
- Detailed manual configuration and troubleshooting instructions are found in [docs/SETUP.md](file:///c:/Users/madhesh/OneDrive/Desktop/qvac/resqmesh/docs/SETUP.md).
