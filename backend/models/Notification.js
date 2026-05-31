const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['notice', 'booking', 'visitor', 'maintenance', 'payment', 'system', 'complaint', 'event'],
      default: 'system',
    },
    priority: {
      type: String,
      enum: ['normal', 'important', 'critical', 'emergency'],
      default: 'normal',
    },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
