const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facility: {
      type: String,
      enum: ['clubhouse', 'gym', 'terrace', 'meeting_hall', 'badminton_court', 'guest_parking_slot'],
      required: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationHours: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'booked', 'completed', 'cancelled'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookingFee: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

// Performance indexes for conflict checks and resident query filters
bookingSchema.index({ societyId: 1, date: 1, facility: 1 }); // Conflict overlap checks
bookingSchema.index({ residentId: 1, date: 1 });              // Daily hour limit checks
bookingSchema.index({ societyId: 1, status: 1 });             // Admin list views

module.exports = mongoose.model('Booking', bookingSchema);
