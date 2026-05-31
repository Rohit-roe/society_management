const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['app_admin', 'society_admin', 'resident', 'security'],
      default: 'resident',
    },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
    flatNumber: { type: String },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'suspended'],
      default: 'active',
    },
    familyMembers: [
      {
        name: { type: String, required: true },
        relation: {
          type: String,
          enum: ['spouse', 'child', 'elderly', 'tenant', 'dependent'],
          required: true,
        },
        phone: { type: String },
        isEmergencyContact: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
