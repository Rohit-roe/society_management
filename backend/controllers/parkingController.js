const Parking = require('../models/Parking');

const getParkingSlots = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'app_admin') {
      filter = { societyId: req.user.societyId };
    } else if (req.query.societyId) {
      filter = { societyId: req.query.societyId };
    }

    const slots = await Parking.find(filter).populate('ownerId', 'name flatNumber');
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createParkingSlot = async (req, res) => {
  try {
    const { slotNumber, type } = req.body;
    if (!slotNumber || !type) {
      return res.status(400).json({ message: 'Slot number and type are required' });
    }

    const existing = await Parking.findOne({
      societyId: req.user.societyId,
      slotNumber,
    });
    if (existing) {
      return res.status(400).json({ message: 'Parking slot already exists' });
    }

    const slot = await Parking.create({
      societyId: req.user.societyId,
      slotNumber,
      type,
      isAvailable: true,
    });

    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignParkingSlot = async (req, res) => {
  try {
    const { vehicleNumber, ownerName, ownerId, isAvailable, complaints } = req.body;
    const updateData = { vehicleNumber, ownerName, ownerId: ownerId || null, isAvailable };
    if (complaints !== undefined) {
      updateData.complaints = complaints;
    }

    const slot = await Parking.findOneAndUpdate(
      { _id: req.params.id, societyId: req.user.societyId },
      updateData,
      { new: true }
    );
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const reportParkingComplaint = async (req, res) => {
  try {
    const { complaint } = req.body;
    if (!complaint?.trim()) {
      return res.status(400).json({ message: 'Complaint text is required' });
    }

    const slot = await Parking.findOneAndUpdate(
      { _id: req.params.id, societyId: req.user.societyId },
      { $push: { complaints: `${req.user.name} (Flat ${req.user.flatNumber || 'N/A'}): ${complaint.trim()}` } },
      { new: true }
    );
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getParkingSlots,
  createParkingSlot,
  assignParkingSlot,
  reportParkingComplaint,
};
