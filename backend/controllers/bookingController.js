const Booking = require('../models/Booking');
const { sendNotification } = require('../utils/notifications');

const getBookings = async (req, res) => {
  try {
    const { facility, date } = req.query;
    let filter = {};

    if (req.user.role !== 'app_admin') {
      filter = { societyId: req.user.societyId };
      if (req.user.role === 'resident') {
        filter.residentId = req.user._id;
      }
    } else if (req.query.societyId) {
      filter = { societyId: req.query.societyId };
    }

    if (facility) filter.facility = facility;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const bookings = await Booking.find(filter)
      .populate('residentId', 'name flatNumber')
      .sort({ date: -1, startTime: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { facility, date, startTime, endTime, durationHours, notes } = req.body;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existing = await Booking.find({
      residentId: req.user._id,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: ['rejected', 'cancelled'] },
    });
    const totalHours = existing.reduce((sum, b) => sum + b.durationHours, 0);
    if (totalHours + durationHours > 2) {
      return res.status(400).json({ message: 'Booking limit: max 2 hours per day' });
    }

    const conflict = await Booking.findOne({
      societyId: req.user.societyId,
      facility,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: ['rejected', 'cancelled'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
    if (conflict) return res.status(409).json({ message: 'Time slot already booked' });

    const FEES = {
      clubhouse: 500,
      terrace: 400,
      meeting_hall: 300,
      badminton_court: 150,
      gym: 0,
      guest_parking_slot: 100,
    };
    const fee = FEES[facility] || 0;

    const booking = await Booking.create({
      societyId: req.user.societyId,
      residentId: req.user._id,
      facility,
      date,
      startTime,
      endTime,
      durationHours,
      bookingFee: fee,
      notes,
      status: fee > 0 ? 'pending' : 'booked', // Booked immediately if free, else pending approval/payment
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let filter = { _id: req.params.id };

    if (req.user.role !== 'society_admin') {
      filter.residentId = req.user._id;
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Residents can only cancel bookings' });
      }
    } else {
      filter.societyId = req.user.societyId;
    }

    const booking = await Booking.findOneAndUpdate(
      filter,
      { status, approvedBy: req.user._id },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const io = req.app.get('io');
    io?.to(String(booking.societyId)).emit('booking-update', {
      facility: booking.facility,
      status: booking.status,
    });

    // Notify resident about admin actions
    if (req.user.role === 'society_admin') {
      let title = `Booking Status Updated`;
      let message = `Your ${booking.facility.replace('_', ' ')} booking status is now ${status}.`;

      if (status === 'approved' || status === 'booked') {
        title = 'Booking Approved';
        message = `Your ${booking.facility.replace('_', ' ')} booking has been approved.`;
      } else if (status === 'rejected') {
        title = 'Booking Rejected';
        message = `Your ${booking.facility.replace('_', ' ')} booking has been rejected.`;
      }

      await sendNotification(io, {
        userId: booking.residentId,
        societyId: booking.societyId,
        title,
        message,
        type: 'booking',
        link: '/bookings',
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBookings, createBooking, updateBookingStatus };
