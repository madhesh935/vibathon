# ResQMesh Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.10+ | https://python.org |
| MongoDB | 7+ | https://www.mongodb.com/try/download/community |
| Ollama | latest | https://ollama.ai |
| Git | any | https://git-scm.com |

---

## Step 1 — Install Ollama and pull the model

```bash
# After installing Ollama, pull the triage model
ollama pull qwen2.5:1.5b

# Verify it works
ollama run qwen2.5:1.5b "Hello"
```

---

## Step 2 — Start MongoDB

**Windows (local install):**
```powershell
mongod --dbpath C:\data\db
```

**macOS / Linux:**
```bash
mongod
```

Alternatively, use [MongoDB Atlas](https://www.mongodb.com/atlas) and update
`MONGO_URI` in `backend/.env`.

---

## Step 3 — Backend

```bash
cd resqmesh/backend
cp .env.example .env        # edit if needed
npm install
npm run dev
```

Runs on **http://localhost:3001**

---

## Step 4 — AI Service

```bash
cd resqmesh/ai-service
pip install -r requirements.txt
python app.py
```

Runs on **http://localhost:5001**

> Make sure Ollama is running (`ollama serve`) before starting this service.

---

## Step 5 — Relay Node

```bash
cd resqmesh/relay-node
pip install -r requirements.txt
python app.py
```

Runs on **http://localhost:5000**

The relay node creates `relay.db` (SQLite) on first start.

---

## Step 6 — Frontend (Victim App + Dashboard)

```bash
cd resqmesh/frontend
cp .env.example .env        # edit VITE_RELAY_URL if relay is on a different host
npm install
npm run dev
```

| Route | URL |
|-------|-----|
| Victim App | http://localhost:3000 |
| Dashboard | http://localhost:3000/dashboard |

Open on phone: replace `localhost` with your machine's local IP (e.g. `http://192.168.1.10:3000`).

---

## Step 7 — Speech Service (Optional)

```bash
cd resqmesh/speech-service
pip install -r requirements.txt
python app.py
```

Runs on **http://localhost:5002**

Send audio:
```bash
curl -X POST http://localhost:5002/transcribe \
  -F "audio=@recording.wav"
```

---

## Port Reference

| Service | Port | Technology |
|---------|------|-----------|
| Backend | 3001 | Node.js / Express / Socket.IO |
| Frontend | 3000 | React / Vite / Leaflet |
| Victim App | / | Mobile SOS portal |
| Dashboard | /dashboard | Command center |
| Relay Node | 5000 | Python / Flask / SQLite |
| AI Service | 5001 | Python / Flask / Ollama |
| Speech Service | 5002 | Python / Flask / Faster-Whisper |
| MongoDB | 27017 | MongoDB |
| Ollama | 11434 | Ollama |

---

## Environment Variables

### backend/.env
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/resqmesh
AI_SERVICE_URL=http://localhost:5001
```

### frontend/.env
```
VITE_RELAY_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:3001
```

---

## Troubleshooting

**MongoDB connection fails:**
- Make sure `mongod` is running
- Check the `MONGO_URI` in `backend/.env`

**AI triage not working:**
- Check Ollama is running: `ollama list`
- Check AI service health: `curl http://localhost:5001/health`
- Reports will still be saved with `priority: HIGH` as fallback

**Victim app can't reach relay:**
- Ensure relay node is running on port 5000
- If accessing from phone, use your machine's LAN IP in `VITE_RELAY_URL`

**Map not showing markers:**
- Markers only appear for reports that include GPS coordinates
- Allow location access in your browser when prompted

**Socket.IO disconnects:**
- Check backend is running
- The clients reconnect automatically
