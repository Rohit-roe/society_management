const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { sendVisitorQR } = require('../utils/sendEmail');
const { sendNotification } = require('../utils/notifications');

const getAllVisitors = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'app_admin') {
      filter = { societyId: req.user.societyId };
    } else if (req.query.societyId) {
      filter = { societyId: req.query.societyId };
    }

    const visitors = await Visitor.find(filter)
      .populate('loggedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyFlatVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({
      societyId: req.user.societyId,
      flatToVisit: req.user.flatNumber,
    }).sort({ createdAt: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const visitors = await Visitor.find({
      societyId: req.user.societyId,
      flatToVisit: req.user.flatNumber,
      approvalStatus: 'pending',
    }).sort({ createdAt: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logVisitor = async (req, res) => {
  try {
    const { visitorName, visitorPhone, flatToVisit, purpose } = req.body;
    const flat = req.user.role === 'resident' ? req.user.flatNumber : flatToVisit;

    if (!flat) return res.status(400).json({ message: 'Flat to visit is required' });

    const isSecurity = req.user.role === 'security';
    const visitor = await Visitor.create({
      societyId: req.user.societyId,
      visitorName,
      visitorPhone,
      flatToVisit: flat,
      purpose,
      checkIn: isSecurity ? null : new Date(),
      approvalStatus: isSecurity ? 'pending' : 'approved',
      preApproved: false,
      loggedBy: req.user._id,
    });

    if (isSecurity) {
      const resident = await User.findOne({
        societyId: req.user.societyId,
        role: 'resident',
        flatNumber: flat,
      });
      if (resident) {
        const io = req.app.get('io');
        await sendNotification(io, {
          userId: resident._id,
          societyId: req.user.societyId,
          title: 'Visitor Approval Needed',
          message: `${visitorName} is at the gate for flat ${flat}.`,
          type: 'visitor',
          link: '/visitors',
        });
      }
    }

    res.status(201).json(visitor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findOneAndUpdate(
      {
        _id: req.params.id,
        societyId: req.user.societyId,
        flatToVisit: req.user.flatNumber,
        approvalStatus: 'pending',
      },
      {
        approvalStatus: 'approved',
        approvedBy: req.user._id,
      },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rejectVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findOneAndUpdate(
      {
        _id: req.params.id,
        societyId: req.user.societyId,
        flatToVisit: req.user.flatNumber,
        approvalStatus: 'pending',
      },
      { approvalStatus: 'rejected', approvedBy: req.user._id },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkinVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findOneAndUpdate(
      {
        _id: req.params.id,
        societyId: req.user.societyId,
        approvalStatus: 'approved',
        checkIn: null,
      },
      {
        approvalStatus: 'checked_in',
        checkIn: new Date(),
      },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ message: 'Approved visitor not found or already checked in' });

    const io = req.app.get('io');
    io?.to(String(req.user.societyId)).emit('visitor-checkin', visitor);

    const resident = await User.findOne({
      societyId: visitor.societyId,
      role: 'resident',
      flatNumber: visitor.flatToVisit,
    });
    if (resident) {
      await sendNotification(io, {
        userId: resident._id,
        societyId: visitor.societyId,
        title: 'Visitor Arrived',
        message: `${visitor.visitorName} has entered the gate.`,
        type: 'visitor',
        link: '/visitors',
      });
    }

    res.json(visitor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const preApproveVisitor = async (req, res) => {
  try {
    const { visitorName, guestEmail, expectedAt, purpose } = req.body;
    const token = uuidv4();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-visitor?token=${token}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);

    const visitor = await Visitor.create({
      societyId: req.user.societyId,
      visitorName,
      flatToVisit: req.user.flatNumber,
      purpose,
      guestEmail,
      expectedAt: new Date(expectedAt),
      approvalToken: token,
      approvalStatus: 'approved',
      preApproved: true,
      qrCodeDataUrl: qrDataUrl,
      loggedBy: req.user._id,
      checkIn: null,
    });

    try {
      await sendVisitorQR(guestEmail, visitorName, req.user.flatNumber, verifyUrl, qrDataUrl);
    } catch (emailErr) {
      console.warn('Email send failed:', emailErr.message);
    }

    res.status(201).json({ visitor, qrDataUrl, verifyUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyVisitorToken = async (req, res) => {
  try {
    const visitor = await Visitor.findOne({
      approvalToken: req.params.token,
      societyId: req.user.societyId,
    }).populate('loggedBy', 'name flatNumber');

    if (!visitor) return res.status(404).json({ message: 'Invalid or expired QR code' });
    if (visitor.approvalStatus === 'checked_in') return res.status(400).json({ message: 'Already checked in' });

    visitor.approvalStatus = 'checked_in';
    visitor.checkIn = new Date();
    await visitor.save();

    const io = req.app.get('io');
    io?.to(String(req.user.societyId)).emit('visitor-checkin', {
      visitorName: visitor.visitorName,
      flatToVisit: visitor.flatToVisit,
      checkIn: visitor.checkIn,
    });

    const resident = await User.findOne({
      societyId: visitor.societyId,
      role: 'resident',
      flatNumber: visitor.flatToVisit,
    });
    if (resident) {
      await sendNotification(io, {
        userId: resident._id,
        societyId: visitor.societyId,
        title: 'Visitor Arrived',
        message: `${visitor.visitorName} has checked in at the gate.`,
        type: 'visitor',
        link: '/visitors',
      });
    }

    res.json({ visitor, message: 'Visitor approved and checked in' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkoutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findOneAndUpdate(
      { _id: req.params.id, societyId: req.user.societyId, approvalStatus: 'checked_in' },
      { approvalStatus: 'checked_out', checkOut: new Date() },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ message: 'Active visitor not found or already checked out' });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/visitors/public/:token — no auth (guest opens QR link)
const getPublicVisitorPass = async (req, res) => {
  try {
    const visitor = await Visitor.findOne({ approvalToken: req.params.token }).select(
      'visitorName flatToVisit expectedAt purpose approvalStatus preApproved checkIn societyId'
    );
    if (!visitor) return res.status(404).json({ message: 'Invalid or expired pass' });
    res.json({
      visitorName: visitor.visitorName,
      flatToVisit: visitor.flatToVisit,
      expectedAt: visitor.expectedAt,
      purpose: visitor.purpose,
      alreadyCheckedIn: Boolean(visitor.checkIn),
      status: visitor.approvalStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllVisitors,
  getMyFlatVisitors,
  getPendingApprovals,
  logVisitor,
  approveVisitor,
  rejectVisitor,
  preApproveVisitor,
  verifyVisitorToken,
  getPublicVisitorPass,
  checkinVisitor,
  checkoutVisitor,
};
