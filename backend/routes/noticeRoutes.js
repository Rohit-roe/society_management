const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, getNotices);
router.post('/', verifyToken, requireRole(['society_admin']), createNotice);
router.put('/:id', verifyToken, requireRole(['society_admin']), updateNotice);
router.delete('/:id', verifyToken, requireRole(['society_admin']), deleteNotice);

module.exports = router;
