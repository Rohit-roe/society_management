const express = require('express');
const router = express.Router();
const { getPenalties, createPenalty, payPenalty } = require('../controllers/penaltyController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, getPenalties);
router.post('/', verifyToken, requireRole(['society_admin']), createPenalty);
router.post('/:id/pay', verifyToken, requireRole(['resident', 'society_admin']), payPenalty);

module.exports = router;
