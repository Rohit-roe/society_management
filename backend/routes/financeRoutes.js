const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  getWallet,
  getTransactions,
} = require('../controllers/financeController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/expenses', verifyToken, getExpenses);
router.post('/expenses', verifyToken, requireRole(['society_admin']), createExpense);
router.get('/wallet', verifyToken, getWallet);
router.get('/transactions', verifyToken, getTransactions);

module.exports = router;
