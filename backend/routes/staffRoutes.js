const express = require('express');
const router = express.Router();
const {
  getStaffMembers,
  createStaffMember,
  updateStaffMember,
  logStaffAttendance,
  assignStaffTask,
  updateStaffTaskStatus,
} = require('../controllers/staffController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, getStaffMembers);
router.post('/', verifyToken, requireRole(['society_admin']), createStaffMember);
router.put('/:id', verifyToken, requireRole(['society_admin']), updateStaffMember);
router.post('/:id/attendance', verifyToken, requireRole(['society_admin']), logStaffAttendance);
router.post('/:id/tasks', verifyToken, requireRole(['society_admin']), assignStaffTask);
router.patch('/:id/tasks/:taskId', verifyToken, requireRole(['resident', 'society_admin']), updateStaffTaskStatus);

module.exports = router;
