const express = require('express');
const router = express.Router();
const {
  getEvents,
  proposeEvent,
  voteOnEvent,
  closeEventVoting,
  updateEventLogistics,
  getPolls,
  createPoll,
  voteOnPoll,
} = require('../controllers/votingController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Event routes
router.get('/events', verifyToken, getEvents);
router.post('/events', verifyToken, requireRole(['resident']), proposeEvent);
router.post('/events/:id/vote', verifyToken, requireRole(['resident']), voteOnEvent);
router.post('/events/:id/close', verifyToken, requireRole(['resident', 'society_admin']), closeEventVoting);
router.put('/events/:id/logistics', verifyToken, requireRole(['society_admin']), updateEventLogistics);

// Poll routes
router.get('/polls', verifyToken, getPolls);
router.post('/polls', verifyToken, requireRole(['society_admin']), createPoll);
router.post('/polls/:id/vote', verifyToken, requireRole(['resident']), voteOnPoll);

module.exports = router;
