const express = require('express');
const router = express.Router();
const { chat, getHistory, clearHistory, sendMessage } = require('../controllers/chatbotController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', verifyToken, requireRole(['resident']), chat);
router.get('/history', verifyToken, requireRole(['resident']), getHistory);
router.delete('/history', verifyToken, requireRole(['resident']), clearHistory);
router.post('/message', verifyToken, sendMessage);

module.exports = router;
