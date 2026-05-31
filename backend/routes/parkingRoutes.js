const express = require('express');
const router = express.Router();
const {
  getParkingSlots,
  createParkingSlot,
  assignParkingSlot,
  reportParkingComplaint,
} = require('../controllers/parkingController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, getParkingSlots);
router.post('/', verifyToken, requireRole(['society_admin']), createParkingSlot);
router.put('/:id/assign', verifyToken, requireRole(['society_admin']), assignParkingSlot);
router.post('/:id/complaint', verifyToken, requireRole(['resident', 'society_admin']), reportParkingComplaint);

module.exports = router;
