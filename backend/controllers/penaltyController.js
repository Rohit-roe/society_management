const Penalty = require('../models/Penalty');
const User = require('../models/User');
const { creditWallet } = require('../utils/financeHelper');

// Get all penalties based on role
const getPenalties = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'resident') {
      filter = { residentId: req.user._id };
    } else if (req.user.role === 'society_admin' || req.user.role === 'security') {
      filter = { societyId: req.user.societyId };
    } else if (req.user.role === 'app_admin') {
      if (req.query.societyId) {
        filter = { societyId: req.query.societyId };
      } else {
        filter = {};
      }
    }

    const penalties = await Penalty.find(filter)
      .populate('residentId', 'name email flatNumber')
      .populate('societyId', 'name')
      .sort({ createdAt: -1 });

    res.json(penalties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a penalty fine (Society Admin)
const createPenalty = async (req, res) => {
  try {
    const { residentId, title, description, category, amount } = req.body;
    if (!residentId || !title || !category || !amount) {
      return res.status(400).json({ message: 'Resident, Title, Category, and Amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    const resident = await User.findById(residentId);
    if (!resident || resident.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(400).json({ message: 'Invalid resident selected' });
    }

    const penalty = await Penalty.create({
      societyId: req.user.societyId,
      residentId,
      flatNumber: resident.flatNumber || 'N/A',
      title,
      description,
      category,
      amount,
      status: 'pending',
    });

    res.status(201).json(penalty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Pay/resolve a penalty (Resident or Admin)
const payPenalty = async (req, res) => {
  try {
    const penalty = await Penalty.findById(req.params.id);
    if (!penalty) return res.status(404).json({ message: 'Penalty not found' });

    // Validate access
    if (req.user.role === 'resident' && penalty.residentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (penalty.status === 'paid') {
      return res.status(400).json({ message: 'Penalty is already paid' });
    }

    penalty.status = 'paid';
    penalty.paidOn = new Date();
    await penalty.save();

    // Credit the wallet
    await creditWallet(
      penalty.societyId,
      'penalty',
      penalty.amount,
      `Paid Penalty Fine: ${penalty.title} (Flat: ${penalty.flatNumber})`
    );

    res.json(penalty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPenalties, createPenalty, payPenalty };
