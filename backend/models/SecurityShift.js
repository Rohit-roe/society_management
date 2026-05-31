const mongoose = require('mongoose');

const securityShiftSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    guardName: { type: String, required: true },
    shift: {
      type: String,
      enum: ['morning', 'afternoon', 'night'],
      required: true,
    },
    assignedZone: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    attendance: [
      {
        date: { type: Date, required: true },
        status: { type: String, enum: ['present', 'absent'], required: true },
        clockIn: { type: Date },
        clockOut: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SecurityShift', securityShiftSchema);
