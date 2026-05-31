const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['cleaner', 'plumber', 'electrician', 'gardener', 'maintenance_worker'],
      required: true,
    },
    phone: { type: String },
    salary: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    attendance: [
      {
        date: { type: Date, required: true },
        status: { type: String, enum: ['present', 'absent'], required: true },
      },
    ],
    tasks: [
      {
        title: { type: String, required: true },
        description: { type: String },
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed'],
          default: 'pending',
        },
        dueDate: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);
