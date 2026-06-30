const reportStore = require('../services/reportStore');
const { callAITriage } = require('../services/aiService');

exports.createReport = async (req, res) => {
  try {
    const { victim_name, message, latitude, longitude, packet_id } = req.body;

    if (!victim_name || !message) {
      return res.status(400).json({ error: 'victim_name and message are required' });
    }

    if (packet_id) {
      const existing = await reportStore.findByPacketId(packet_id);
      if (existing) {
        console.log(`[Report] Duplicate packet_id ${packet_id}, returning existing`);
        return res.json({ success: true, report: existing, duplicate: true });
      }
    }

    const report = await reportStore.create({
      packet_id: packet_id || `PKT-${Date.now()}`,
      victim_name,
      message,
      latitude: latitude || null,
      longitude: longitude || null,
    });

    console.log(`[Report] Saved report ${report._id} from ${victim_name}`);

    req.io.emit('new-report', report);
    callAITriage(report._id.toString(), message, req.io).catch(console.error);

    res.json({ success: true, report });
  } catch (err) {
    console.error('[Report] Create error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await reportStore.findAll();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await reportStore.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendResponse = async (req, res) => {
  try {
    const { report_id, response_message, status } = req.body;

    if (!report_id || !response_message) {
      return res.status(400).json({ error: 'report_id and response_message are required' });
    }

    const report = await reportStore.updateById(report_id, {
      response: response_message,
      status: status || 'ASSIGNED',
    });

    if (!report) return res.status(404).json({ error: 'Report not found' });

    req.io.emit('rescue-response', { report_id, response: response_message, report });
    req.io.emit('status-updated', { report_id, status: report.status, report });

    console.log(`[Report] Response sent for report ${report_id}`);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const stats = await reportStore.getStatistics();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
