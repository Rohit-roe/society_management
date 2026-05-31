const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    visitorName: { type: String, required: true },
    visitorPhone: { type: String },
    flatToVisit: { type: String, required: true },
    purpose: { type: String },
    checkIn: { type: Date },
    checkOut: { type: Date },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvalToken: { type: String },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired', 'checked_in', 'checked_out'],
      default: 'pending',
    },
    preApproved: { type: Boolean, default: false },
    expectedAt: { type: Date },
    guestEmail: { type: String },
    qrCodeDataUrl: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Performance indexes for high-frequency queries
visitorSchema.index({ societyId: 1, createdAt: -1 });
visitorSchema.index({ approvalToken: 1 });
visitorSchema.index({ societyId: 1, approvalStatus: 1 });
visitorSchema.index({ expectedAt: 1, approvalStatus: 1 }); // Supports expiry scheduler

module.exports = mongoose.model('Visitor', visitorSchema);
