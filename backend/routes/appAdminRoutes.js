const express = require('express');
const router = express.Router();
const {
  getSocietyRequests,
  approveSocietyRequest,
  rejectSocietyRequest,
  toggleUserSuspension,
  toggleSocietySuspension,
  getAuditLogs,
  getGlobalSummary,
} = require('../controllers/appAdminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Secure all routes under App Admin
router.use(verifyToken, requireRole(['app_admin']));

router.get('/requests', getSocietyRequests);
router.post('/requests/:id/approve', approveSocietyRequest);
router.post('/requests/:id/reject', rejectSocietyRequest);
router.post('/users/:id/suspend', toggleUserSuspension);
router.post('/societies/:id/suspend', toggleSocietySuspension);
router.get('/audit-logs', getAuditLogs);
router.get('/summary', getGlobalSummary);

module.exports = router;
