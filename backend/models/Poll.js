const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    votesYes: [{ type: String }], // Array of flat numbers that voted yes
    votesNo: [{ type: String }],  // Array of flat numbers that voted no
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Poll', pollSchema);
