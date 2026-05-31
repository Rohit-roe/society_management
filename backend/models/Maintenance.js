const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    flatNumber: { type: String, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    paidOn: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

maintenanceSchema.index({ societyId: 1, flatNumber: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
