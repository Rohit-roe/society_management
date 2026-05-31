const mongoose = require('mongoose');

const eventProposalSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['festival', 'sports_day', 'society_dinner', 'cultural_event', 'custom'],
      required: true,
    },
    budget: { type: Number, required: true },
    contributionRequirement: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['proposed', 'approved', 'rejected', 'completed'],
      default: 'proposed',
    },
    votesYes: [{ type: String }], // Array of flat numbers that voted yes
    votesNo: [{ type: String }],  // Array of flat numbers that voted no
    eligibleVotersCount: { type: Number }, // totalFlats at the time of proposal
    deadline: { type: Date, required: true },
    logistics: { type: String }, // filled by society admin
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventProposal', eventProposalSchema);
