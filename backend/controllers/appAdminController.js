const User = require('../models/User');
const Society = require('../models/Society');
const SocietyRequest = require('../models/SocietyRequest');
const SocietyWallet = require('../models/SocietyWallet');
const AuditLog = require('../models/AuditLog');
const SupportTicket = require('../models/SupportTicket');
const Expense = require('../models/Expense');
const Booking = require('../models/Booking');
const Visitor = require('../models/Visitor');
const EventProposal = require('../models/EventProposal');
const Poll = require('../models/Poll');
const Maintenance = require('../models/Maintenance');

// Get all society requests
const getSocietyRequests = async (req, res) => {
  try {
    const requests = await SocietyRequest.find().populate('requestedBy', 'name email phone').sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve society request
const approveSocietyRequest = async (req, res) => {
  try {
    const request = await SocietyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    const society = await Society.create({
      name: request.name,
      address: request.address,
      city: request.city,
      totalFlats: request.totalFlats,
      createdBy: request.requestedBy,
    });

    // Create wallet for the new society
    await SocietyWallet.create({
      societyId: society._id,
      balance: 0,
    });

    // Update User
    const user = await User.findById(request.requestedBy);
    if (user) {
      user.societyId = society._id;
      user.isActive = true;
      user.status = 'active';
      await user.save();
    }

    request.status = 'approved';
    await request.save();

    await AuditLog.create({
      action: 'SOCIETY_APPROVED',
      performedBy: req.user._id,
      details: `Approved society request for: ${society.name} (City: ${society.city})`,
      societyId: society._id,
    });

    res.json({ message: 'Society approved successfully', society });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject society request
const rejectSocietyRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) return res.status(400).json({ message: 'Rejection reason required' });

    const request = await SocietyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'rejected';
    request.rejectionReason = rejectionReason;
    await request.save();

    const user = await User.findById(request.requestedBy);
    if (user) {
      user.status = 'rejected';
      await user.save();
    }

    await AuditLog.create({
      action: 'SOCIETY_REJECTED',
      performedBy: req.user._id,
      details: `Rejected society request for: ${request.name}. Reason: ${rejectionReason}`,
    });

    res.json({ message: 'Society request rejected successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle user suspension
const toggleUserSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'app_admin') return res.status(400).json({ message: 'Super admin cannot be suspended' });

    const isCurrentlySuspended = user.status === 'suspended';
    user.status = isCurrentlySuspended ? 'active' : 'suspended';
    user.isActive = isCurrentlySuspended; // sync isActive
    await user.save();

    await AuditLog.create({
      action: isCurrentlySuspended ? 'USER_UNSUSPENDED' : 'USER_SUSPENDED',
      performedBy: req.user._id,
      details: `${isCurrentlySuspended ? 'Unsuspended' : 'Suspended'} user: ${user.name} (${user.email})`,
      societyId: user.societyId,
    });

    res.json({ message: `User ${isCurrentlySuspended ? 'unsuspended' : 'suspended'} successfully`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle society suspension
const toggleSocietySuspension = async (req, res) => {
  try {
    const society = await Society.findById(req.params.id);
    if (!society) return res.status(404).json({ message: 'Society not found' });

    const isCurrentlySuspended = society.status === 'suspended';
    society.status = isCurrentlySuspended ? 'active' : 'suspended';
    await society.save();

    await AuditLog.create({
      action: isCurrentlySuspended ? 'SOCIETY_UNSUSPENDED' : 'SOCIETY_SUSPENDED',
      performedBy: req.user._id,
      details: `${isCurrentlySuspended ? 'Unsuspended' : 'Suspended'} society: ${society.name}`,
      societyId: society._id,
    });

    res.json({ message: `Society ${isCurrentlySuspended ? 'unsuspended' : 'suspended'} successfully`, society });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .populate('societyId', 'name')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Global summary / statistics
const getGlobalSummary = async (req, res) => {
  try {
    const societyCount = await Society.countDocuments();
    const userCount = await User.countDocuments({ role: { $ne: 'app_admin' } });
    const activeComplaints = await SupportTicket.countDocuments({ status: { $ne: 'resolved' } });
    const visitorCount = await Visitor.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    const totalExpensesList = await Expense.find();
    const totalExpenses = totalExpensesList.reduce((acc, curr) => acc + curr.amount, 0);

    const wallets = await SocietyWallet.find().populate('societyId', 'name');
    const totalReserve = wallets.reduce((acc, curr) => acc + (curr.reserveFund || 0), 0);
    const totalWalletBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);

    // Dues tracking
    const pendingDuesList = await Maintenance.find({ status: { $in: ['pending', 'overdue'] } });
    const totalPendingDues = pendingDuesList.reduce((acc, curr) => acc + curr.amount, 0);

    // Event & voting participation
    const pollCount = await Poll.countDocuments();
    const eventCount = await EventProposal.countDocuments();
    const pollsList = await Poll.find();
    const totalPollVotes = pollsList.reduce(
      (acc, curr) => acc + (curr.votesYes?.length || 0) + (curr.votesNo?.length || 0),
      0
    );

    // High defaulter societies
    const highDefaulters = await Maintenance.aggregate([
      { $match: { status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: '$societyId', unpaidAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { unpaidAmount: -1 } },
      { $limit: 5 },
    ]);

    const highDefaulterSocieties = await Promise.all(
      highDefaulters.map(async (item) => {
        const soc = await Society.findById(item._id).select('name');
        return {
          societyName: soc?.name || 'Unknown',
          unpaidAmount: item.unpaidAmount,
          count: item.count,
        };
      })
    );

    res.json({
      societyCount,
      userCount,
      activeComplaints,
      visitorCount,
      bookingsCount,
      totalExpenses,
      totalReserve,
      totalWalletBalance,
      totalPendingDues,
      pollCount,
      eventCount,
      totalPollVotes,
      highDefaulterSocieties,
      wallets,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSocietyRequests,
  approveSocietyRequest,
  rejectSocietyRequest,
  toggleUserSuspension,
  toggleSocietySuspension,
  getAuditLogs,
  getGlobalSummary,
};
