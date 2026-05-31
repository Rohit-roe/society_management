const express = require('express');
const router = express.Router();
const {
  getBookings,
  createBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, getBookings);
router.post('/', verifyToken, requireRole(['resident']), createBooking);
router.patch('/:id', verifyToken, requireRole(['resident', 'society_admin']), updateBookingStatus);

module.exports = router;
