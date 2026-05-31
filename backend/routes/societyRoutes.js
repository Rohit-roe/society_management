const express = require('express');
const router = express.Router();
const {
  getAllSocieties,
  createSociety,
  updateSociety,
  deleteSociety,
  getAvailableResidents,
} = require('../controllers/societyController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', getAllSocieties);
router.get('/:id/available-residents', getAvailableResidents);
router.post('/', verifyToken, requireRole(['app_admin']), createSociety);
router.put('/:id', verifyToken, requireRole(['app_admin']), updateSociety);
router.delete('/:id', verifyToken, requireRole(['app_admin']), deleteSociety);

module.exports = router;
