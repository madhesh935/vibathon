require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const reportRoutes = require('./routes/reportRoutes');
const reportStore = require('./services/reportStore');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.use('/api', reportRoutes);

app.get('/', (_req, res) =>
  res.json({
    service: 'ResQMesh Backend',
    status: 'running',
    version: '1.0.0',
    storage: reportStore.getMode(),
  })
);

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  socket.on('disconnect', () =>
    console.log(`[Socket] Client disconnected: ${socket.id}`)
  );
});

const PORT = process.env.PORT || 3001;

reportStore.init().then((storageMode) => {
  server.listen(PORT, () => {
    console.log(`[Server] ResQMesh backend running on http://localhost:${PORT}`);
    console.log(`[Server] Storage mode: ${storageMode.toUpperCase()}`);
  });
});
