const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flatNumber: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['late_maintenance', 'parking_violation', 'damage_penalty', 'rule_violation', 'other'],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidOn: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Penalty', penaltySchema);
