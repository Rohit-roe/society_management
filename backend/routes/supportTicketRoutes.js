const express = require('express');
const router = express.Router();
const {
  getTickets,
  createTicket,
  updateTicketStatus,
  assignTicket,
} = require('../controllers/supportTicketController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, getTickets);
router.post('/', verifyToken, requireRole(['resident']), createTicket);
router.patch('/:id', verifyToken, requireRole(['resident', 'society_admin', 'app_admin']), updateTicketStatus);
router.put('/:id/assign', verifyToken, requireRole(['society_admin']), assignTicket);

module.exports = router;
