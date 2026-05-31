const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/create-order', verifyToken, requireRole(['resident']), createOrder);
router.post('/verify', verifyToken, requireRole(['resident']), verifyPayment);

module.exports = router;
