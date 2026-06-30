const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const EmergencyReport = require('../models/EmergencyReport');

// ─── Storage mode ────────────────────────────────────────────────────────────
let mode = 'file'; // 'mongodb' | 'file'

// ─── File-based persistent store ─────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, '..', 'data', 'reports.json');

function readFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeFile(store) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('[FileStore] Write error:', e.message);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resqmesh';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    mode = 'mongodb';
    console.log('[DB] MongoDB connected — using persistent MongoDB storage');
    return mode;
  } catch (err) {
    mode = 'file';
    console.warn('[DB] MongoDB unavailable:', err.message);
    console.log('[DB] Using file-based store →', DATA_FILE);
    // Ensure the data directory exists
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) writeFile({});
    return mode;
  }
}

function getMode() {
  return mode;
}

// ─── CRUD (file mode) ─────────────────────────────────────────────────────────

async function findByPacketId(packetId) {
  if (mode === 'mongodb') {
    return EmergencyReport.findOne({ packet_id: packetId });
  }
  const store = readFile();
  return Object.values(store).find((r) => r.packet_id === packetId) || null;
}

async function create(data) {
  if (mode === 'mongodb') {
    const report = new EmergencyReport(data);
    await report.save();
    return report;
  }

  const report = {
    _id: randomUUID(),
    packet_id: data.packet_id || `PKT-${Date.now()}`,
    victim_name: data.victim_name,
    message: data.message,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    priority: 'MEDIUM',
    advice: '',
    status: 'PENDING',
    response: '',
    created_at: new Date().toISOString(),
  };

  const store = readFile();
  store[report._id] = report;
  writeFile(store);
  return { ...report };
}

async function findById(id) {
  if (mode === 'mongodb') {
    return EmergencyReport.findById(id);
  }
  const store = readFile();
  return store[id] ? { ...store[id] } : null;
}

async function updateById(id, updates) {
  if (mode === 'mongodb') {
    return EmergencyReport.findByIdAndUpdate(id, updates, { new: true });
  }

  const store = readFile();
  if (!store[id]) return null;

  const updated = { ...store[id], ...updates };
  store[id] = updated;
  writeFile(store);
  return { ...updated };
}

async function findAll() {
  if (mode === 'mongodb') {
    return EmergencyReport.find().sort({ created_at: -1 }).limit(200);
  }

  const store = readFile();
  return Object.values(store)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 200)
    .map((r) => ({ ...r }));
}

async function getStatistics() {
  if (mode === 'mongodb') {
    const [total, pending, assigned, resolved, critical, high] = await Promise.all([
      EmergencyReport.countDocuments(),
      EmergencyReport.countDocuments({ status: 'PENDING' }),
      EmergencyReport.countDocuments({ status: 'ASSIGNED' }),
      EmergencyReport.countDocuments({ status: 'RESOLVED' }),
      EmergencyReport.countDocuments({ priority: 'CRITICAL' }),
      EmergencyReport.countDocuments({ priority: 'HIGH' }),
    ]);
    return { total, pending, assigned, resolved, critical, high };
  }

  const store = readFile();
  const reports = Object.values(store);
  return {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'PENDING').length,
    assigned: reports.filter((r) => r.status === 'ASSIGNED').length,
    resolved: reports.filter((r) => r.status === 'RESOLVED').length,
    critical: reports.filter((r) => r.priority === 'CRITICAL').length,
    high: reports.filter((r) => r.priority === 'HIGH').length,
  };
}

module.exports = {
  init,
  getMode,
  findByPacketId,
  create,
  findById,
  updateById,
  findAll,
  getStatistics,
};
