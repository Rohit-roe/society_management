const Maintenance = require('../models/Maintenance');
const { sendNotification } = require('../utils/notifications');

const getAllMaintenance = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'app_admin') {
      filter = { societyId: req.user.societyId };
    } else if (req.query.societyId) {
      filter = { societyId: req.query.societyId };
    }

    const records = await Maintenance.find(filter)
      .populate('residentId', 'name email')
      .sort({ year: -1, month: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyMaintenance = async (req, res) => {
  try {
    const records = await Maintenance.find({
      societyId: req.user.societyId,
      flatNumber: req.user.flatNumber,
    }).sort({ year: -1, month: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllFlatsCurrentMonth = async (req, res) => {
  try {
    const now = new Date();
    const records = await Maintenance.find({
      societyId: req.user.societyId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }).populate('residentId', 'name');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createMaintenanceRecord = async (req, res) => {
  try {
    const { flatNumber, residentId, month, year, amount } = req.body;
    const record = await Maintenance.create({
      societyId: req.user.societyId,
      flatNumber,
      residentId,
      month,
      year,
      amount,
    });
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Maintenance record already exists for this flat and month' });
    }
    res.status(500).json({ message: err.message });
  }
};

const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status, updatedBy: req.user._id };
    if (status === 'paid') updateData.paidOn = new Date();

    const oldRecord = await Maintenance.findOne({ _id: req.params.id, societyId: req.user.societyId });
    if (!oldRecord) return res.status(404).json({ message: 'Record not found' });
    const wasPaid = oldRecord.status === 'paid';

    const record = await Maintenance.findOneAndUpdate(
      { _id: req.params.id, societyId: req.user.societyId },
      updateData,
      { new: true }
    );

    if (record && status === 'paid' && !wasPaid) {
      const { creditWallet } = require('../utils/financeHelper');
      await creditWallet(
        req.user.societyId,
        'maintenance',
        record.amount,
        `Maintenance payment (manual) for Flat ${record.flatNumber}`
      );
    }

    const io = req.app.get('io');
    io?.to(String(req.user.societyId)).emit('maintenance-update', {
      flatNumber: record.flatNumber,
      status: record.status,
    });

    if (record.residentId) {
      await sendNotification(io, {
        userId: record.residentId,
        societyId: req.user.societyId,
        title: 'Maintenance Updated',
        message: `Flat ${record.flatNumber} status is now ${record.status}.`,
        type: 'maintenance',
        link: '/maintenance/my',
      });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const data = await Maintenance.aggregate([
      { $match: { societyId: req.user.societyId } },
      {
        $group: {
          _id: { month: '$month', year: '$year', status: '$status' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDefaulters = async (req, res) => {
  try {
    const overdueRecords = await Maintenance.find({
      societyId: req.user.societyId,
      status: { $in: ['pending', 'overdue'] },
    }).populate('residentId', 'name email phone');

    const defaultersMap = {};
    for (const record of overdueRecords) {
      const flat = record.flatNumber;
      if (!defaultersMap[flat]) {
        defaultersMap[flat] = {
          flatNumber: flat,
          residentName: record.residentId?.name || 'N/A',
          residentEmail: record.residentId?.email || 'N/A',
          residentPhone: record.residentId?.phone || 'N/A',
          totalAmount: 0,
          unpaidCount: 0,
          unpaidMonths: [],
        };
      }
      defaultersMap[flat].totalAmount += record.amount;
      defaultersMap[flat].unpaidCount += 1;
      defaultersMap[flat].unpaidMonths.push(`${record.month}/${record.year}`);
    }

    const defaulters = Object.values(defaultersMap).sort((a, b) => b.totalAmount - a.totalAmount);
    res.json(defaulters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllMaintenance,
  getMyMaintenance,
  getAllFlatsCurrentMonth,
  createMaintenanceRecord,
  updateMaintenanceStatus,
  getAnalytics,
  getDefaulters,
};
