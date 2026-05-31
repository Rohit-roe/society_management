const mongoose = require('mongoose');

const societyRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    totalFlats: { type: Number, required: true },
    estimatedResidents: { type: Number },
    contactNumber: { type: String },
    proofDocument: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocietyRequest', societyRequestSchema);
