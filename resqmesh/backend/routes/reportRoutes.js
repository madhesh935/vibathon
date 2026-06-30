const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReport,
  sendResponse,
  getStatistics,
} = require('../controllers/reportController');

router.post('/report', createReport);
router.get('/reports', getReports);
router.get('/report/:id', getReport);
router.post('/respond', sendResponse);
router.get('/statistics', getStatistics);

module.exports = router;
