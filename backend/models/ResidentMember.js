const mongoose = require('mongoose');

const residentMemberSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    houseNo: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    familyCount: { type: Number, default: 0 },
    residentType: {
      type: String,
      enum: ['owner', 'tenant', 'family_member'],
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Compound index so a name & houseNo combo is unique within a society
residentMemberSchema.index({ societyId: 1, houseNo: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('ResidentMember', residentMemberSchema);
