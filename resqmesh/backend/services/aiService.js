const axios = require('axios');
const reportStore = require('./reportStore');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

exports.callAITriage = async (reportId, message, io) => {
  try {
    console.log(`[AI] Triaging report ${reportId}: "${message.slice(0, 60)}..."`);

    const { data } = await axios.post(
      `${AI_SERVICE_URL}/triage`,
      { message },
      { timeout: 60000 }
    );

    const priority = data.priority || 'HIGH';
    const advice = data.advice || 'Manual triage required';

    const report = await reportStore.updateById(reportId, { priority, advice });

    console.log(`[AI] Report ${reportId} → ${priority}`);
    io.emit('priority-updated', { report_id: reportId, priority, advice, report });
  } catch (err) {
    console.error(`[AI] Triage failed for ${reportId}: ${err.message}`);

    const report = await reportStore.updateById(reportId, {
      priority: 'HIGH',
      advice: 'AI unavailable — manual triage required',
    });

    if (report) {
      io.emit('priority-updated', {
        report_id: reportId,
        priority: 'HIGH',
        advice: 'AI unavailable — manual triage required',
        report,
      });
    }
  }
};
