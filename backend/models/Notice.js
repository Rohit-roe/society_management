const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    priority: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
