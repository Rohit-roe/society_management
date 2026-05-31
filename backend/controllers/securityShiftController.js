const SecurityShift = require('../models/SecurityShift');

const getSecurityShifts = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'app_admin') {
      filter = { societyId: req.user.societyId };
    } else if (req.query.societyId) {
      filter = { societyId: req.query.societyId };
    }

    const shifts = await SecurityShift.find(filter);
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSecurityShift = async (req, res) => {
  try {
    const { guardName, shift, assignedZone } = req.body;
    if (!guardName || !shift || !assignedZone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newShift = await SecurityShift.create({
      societyId: req.user.societyId,
      guardName,
      shift,
      assignedZone,
      status: 'active',
      attendance: [],
    });

    res.status(201).json(newShift);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSecurityShift = async (req, res) => {
  try {
    const { guardName, shift, assignedZone, status } = req.body;
    const updated = await SecurityShift.findOneAndUpdate(
      { _id: req.params.id, societyId: req.user.societyId },
      { guardName, shift, assignedZone, status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Guard/Shift roster not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logAttendance = async (req, res) => {
  try {
    const { status, clockIn, clockOut } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shiftRecord = await SecurityShift.findOne({
      _id: req.params.id,
      societyId: req.user.societyId,
    });

    if (!shiftRecord) return res.status(404).json({ message: 'Guard roster not found' });

    // Check if attendance exists for today
    let index = shiftRecord.attendance.findIndex(
      (a) => new Date(a.date).toDateString() === today.toDateString()
    );

    if (index !== -1) {
      // Update existing attendance
      if (status) shiftRecord.attendance[index].status = status;
      if (clockIn) shiftRecord.attendance[index].clockIn = new Date(clockIn);
      if (clockOut) shiftRecord.attendance[index].clockOut = new Date(clockOut);
    } else {
      // Add new attendance entry
      shiftRecord.attendance.push({
        date: today,
        status: status || 'present',
        clockIn: clockIn ? new Date(clockIn) : new Date(),
        clockOut: clockOut ? new Date(clockOut) : null,
      });
    }

    await shiftRecord.save();
    res.json(shiftRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSecurityShifts,
  createSecurityShift,
  updateSecurityShift,
  logAttendance,
};
