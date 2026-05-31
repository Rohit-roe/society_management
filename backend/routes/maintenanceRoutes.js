const express = require('express');
const router = express.Router();
const {
  getAllMaintenance,
  getMyMaintenance,
  getAllFlatsCurrentMonth,
  createMaintenanceRecord,
  updateMaintenanceStatus,
  getAnalytics,
  getDefaulters,
} = require('../controllers/maintenanceController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/analytics', verifyToken, requireRole(['society_admin']), getAnalytics);
router.get('/defaulters', verifyToken, requireRole(['society_admin']), getDefaulters);
router.get('/', verifyToken, requireRole(['society_admin', 'app_admin']), getAllMaintenance);
router.get('/my', verifyToken, requireRole(['resident']), getMyMaintenance);
router.get('/all', verifyToken, requireRole(['resident', 'society_admin']), getAllFlatsCurrentMonth);
router.post('/', verifyToken, requireRole(['society_admin']), createMaintenanceRecord);
router.patch('/:id', verifyToken, requireRole(['society_admin']), updateMaintenanceStatus);

module.exports = router;
