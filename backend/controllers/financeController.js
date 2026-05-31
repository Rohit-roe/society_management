const Expense = require('../models/Expense');
const SocietyWallet = require('../models/SocietyWallet');
const WalletTransaction = require('../models/WalletTransaction');
const { debitWallet } = require('../utils/financeHelper');

// Get all expenses based on role
const getExpenses = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'app_admin') {
      filter = { societyId: req.user.societyId };
    } else if (req.query.societyId) {
      filter = { societyId: req.query.societyId };
    }

    const expenses = await Expense.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('societyId', 'name')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new expense (Society Admin)
const createExpense = async (req, res) => {
  try {
    const { title, category, vendor, amount, invoice, description, date } = req.body;
    if (!title || !category || !vendor || !amount) {
      return res.status(400).json({ message: 'Title, Category, Vendor, and Amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Overdraft check: debit wallet FIRST — rejects if insufficient funds
    try {
      await debitWallet(
        req.user.societyId,
        category,
        amount,
        `Expense for: ${title} (Vendor: ${vendor})`
      );
    } catch (debitErr) {
      return res.status(debitErr.statusCode || 400).json({ message: debitErr.message });
    }

    // Only create expense document if wallet debit succeeded
    const expense = await Expense.create({
      societyId: req.user.societyId,
      title,
      category,
      vendor,
      amount,
      invoice,
      description,
      date: date || new Date(),
      uploadedBy: req.user._id,
    });

    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'EXPENSE_UPLOAD',
      performedBy: req.user._id,
      details: `Recorded expense: "${title}" (Amount: ₹${amount}, Vendor: ${vendor})`,
      societyId: req.user.societyId,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get wallet balance and statistics
const getWallet = async (req, res) => {
  try {
    let societyId = req.user.societyId;
    if (req.user.role === 'app_admin') {
      if (req.query.societyId) {
        societyId = req.query.societyId;
      } else {
        // App Admin requesting all wallets
        const wallets = await SocietyWallet.find().populate('societyId', 'name');
        return res.json(wallets);
      }
    }

    let wallet = await SocietyWallet.findOne({ societyId }).populate('societyId', 'name');
    if (!wallet) {
      wallet = await SocietyWallet.create({ societyId, balance: 0 });
    }

    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get ledger transactions
const getTransactions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'app_admin') {
      filter = { societyId: req.user.societyId };
    } else if (req.query.societyId) {
      filter = { societyId: req.query.societyId };
    }

    const transactions = await WalletTransaction.find(filter)
      .populate('societyId', 'name')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getExpenses, createExpense, getWallet, getTransactions };
