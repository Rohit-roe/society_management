const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    flatNumber: { type: String },
    subject: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['water', 'lift', 'electricity', 'parking', 'security', 'noise', 'plumbing', 'custom'],
      default: 'custom',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    attachment: { type: String },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'escalated'],
      default: 'open',
    },
    source: { type: String, enum: ['chatbot', 'manual'], default: 'manual' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
