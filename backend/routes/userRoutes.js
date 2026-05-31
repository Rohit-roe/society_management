const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getSocietyUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, requireRole(['app_admin']), getAllUsers);
router.get('/society', verifyToken, requireRole(['society_admin']), getSocietyUsers);
router.put('/:id/role', verifyToken, requireRole(['app_admin']), updateUserRole);
router.delete('/:id', verifyToken, requireRole(['app_admin']), deleteUser);

module.exports = router;
