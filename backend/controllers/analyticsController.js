const Maintenance = require('../models/Maintenance');
const Visitor = require('../models/Visitor');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Society = require('../models/Society');
const Notice = require('../models/Notice');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getRevenueData = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const data = await Maintenance.aggregate([
      { $match: { societyId: req.user.societyId, year, status: 'paid' } },
      { $group: { _id: '$month', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(data.map((d) => ({ month: MONTHS[d._id - 1], revenue: d.total, flats: d.count })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCollectionRate = async (req, res) => {
  try {
    const now = new Date();
    const data = await Maintenance.aggregate([
      {
        $match: {
          societyId: req.user.societyId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json(data.map((d) => ({ name: d._id, value: d.count })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVisitorTraffic = async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const data = await Visitor.aggregate([
      { $match: { societyId: req.user.societyId, checkIn: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkIn' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(data.map((d) => ({ date: d._id, visitors: d.count })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFacilityUsage = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { societyId: req.user.societyId, status: 'approved' } },
      { $group: { _id: '$facility', bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
    ]);
    res.json(data.map((d) => ({ facility: d._id, bookings: d.bookings })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const society = await Society.findById(req.user.societyId).select('totalFlats name');
    const [totalResidents, pendingDues, overdueCount] = await Promise.all([
      User.countDocuments({ societyId: req.user.societyId, role: 'resident', isActive: true }),
      Maintenance.countDocuments({ societyId: req.user.societyId, status: 'pending' }),
      Maintenance.countDocuments({ societyId: req.user.societyId, status: 'overdue' }),
    ]);

    const totalFlats = society?.totalFlats || 0;
    const occupancyPercent =
      totalFlats > 0 ? Math.round((totalResidents / totalFlats) * 100) : 0;

    res.json({
      totalResidents,
      totalFlats,
      occupancyPercent,
      vacantFlats: Math.max(0, totalFlats - totalResidents),
      pendingDues,
      overdueCount,
      societyName: society?.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNoticeEngagement = async (req, res) => {
  try {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const notices = await Notice.find({
      societyId: req.user.societyId,
      createdAt: { $gte: since },
    })
      .select('title priority createdAt')
      .sort({ createdAt: -1 })
      .limit(12);

    res.json(
      notices.map((n) => ({
        name: n.title.length > 28 ? `${n.title.slice(0, 28)}…` : n.title,
        fullTitle: n.title,
        priority: n.priority,
        posted: new Date(n.createdAt).toLocaleDateString(),
        engagement: 1,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getRevenueData,
  getCollectionRate,
  getVisitorTraffic,
  getFacilityUsage,
  getSummary,
  getNoticeEngagement,
};
