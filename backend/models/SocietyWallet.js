const mongoose = require('mongoose');

const societyWalletSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, unique: true },
    balance: { type: Number, default: 0 },
    reserveFund: { type: Number, default: 0 },
    maintenanceIncome: { type: Number, default: 0 },
    eventContributions: { type: Number, default: 0 },
    penaltiesIncome: { type: Number, default: 0 },
    expensesAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocietyWallet', societyWalletSchema);
