const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    slotNumber: { type: String, required: true },
    type: {
      type: String,
      enum: ['resident', 'visitor', 'guest', 'reserved'],
      required: true,
    },
    vehicleNumber: { type: String },
    ownerName: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isAvailable: { type: Boolean, default: true },
    complaints: [{ type: String }],
  },
  { timestamps: true }
);

// Prevent duplicate slot numbers within the same society
parkingSchema.index({ societyId: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('Parking', parkingSchema);
