const mongoose = require('mongoose');

const EmergencyReportSchema = new mongoose.Schema({
  packet_id: { type: String, unique: true, sparse: true },
  victim_name: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  },
  advice: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'ASSIGNED', 'RESOLVED'],
    default: 'PENDING',
  },
  response: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EmergencyReport', EmergencyReportSchema);
