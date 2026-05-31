const express = require('express');
const router = express.Router();
const {
  getSecurityShifts,
  createSecurityShift,
  updateSecurityShift,
  logAttendance,
} = require('../controllers/securityShiftController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, getSecurityShifts);
router.post('/', verifyToken, requireRole(['society_admin']), createSecurityShift);
router.put('/:id', verifyToken, requireRole(['society_admin']), updateSecurityShift);
router.post('/:id/attendance', verifyToken, requireRole(['society_admin', 'security']), logAttendance);

module.exports = router;
