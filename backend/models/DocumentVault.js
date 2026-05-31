const mongoose = require('mongoose');

const documentVaultSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['bylaws', 'agm_reports', 'maintenance_notices', 'contracts', 'vendor_docs', 'safety_docs', 'event_docs', 'other'],
      required: true,
    },
    fileUrl: { type: String, required: true }, // local or Cloudinary path
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentVault', documentVaultSchema);
