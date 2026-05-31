const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markRead,
  markAllRead,
} = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getNotifications);
router.patch('/:id/read', verifyToken, markRead);
router.patch('/read-all', verifyToken, markAllRead);

module.exports = router;
