const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['repairs', 'electricity', 'water', 'security', 'salary', 'cleaning', 'events', 'emergency', 'custom'],
      required: true,
    },
    vendor: { type: String, required: true },
    amount: { type: Number, required: true },
    invoice: { type: String }, // path/URL to invoice file
    description: { type: String },
    date: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
