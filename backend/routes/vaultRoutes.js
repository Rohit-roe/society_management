const express = require('express');
const router = express.Router();
const { getDocuments, createDocument } = require('../controllers/vaultController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, getDocuments);
router.post('/', verifyToken, requireRole(['society_admin']), createDocument);

module.exports = router;
