const express = require('express');
const router = express.Router();
const {
  getRevenueData,
  getCollectionRate,
  getVisitorTraffic,
  getFacilityUsage,
  getSummary,
  getNoticeEngagement,
} = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const adminOnly = [verifyToken, requireRole(['society_admin'])];

router.get('/revenue', ...adminOnly, getRevenueData);
router.get('/collection', ...adminOnly, getCollectionRate);
router.get('/visitors', ...adminOnly, getVisitorTraffic);
router.get('/facilities', ...adminOnly, getFacilityUsage);
router.get('/summary', ...adminOnly, getSummary);
router.get('/notices', ...adminOnly, getNoticeEngagement);

module.exports = router;
