const SocietyWallet = require('../models/SocietyWallet');
const WalletTransaction = require('../models/WalletTransaction');

const creditWallet = async (societyId, category, amount, description) => {
  try {
    let wallet = await SocietyWallet.findOne({ societyId });
    if (!wallet) {
      wallet = await SocietyWallet.create({ societyId, balance: 0 });
    }

    wallet.balance += Number(amount);
    if (category === 'maintenance') {
      wallet.maintenanceIncome += Number(amount);
    } else if (category === 'penalty') {
      wallet.penaltiesIncome += Number(amount);
    } else if (category === 'event_contribution') {
      wallet.eventContributions += Number(amount);
    } else if (category === 'reserve_fund') {
      wallet.reserveFund += Number(amount);
    }
    await wallet.save();

    await WalletTransaction.create({
      societyId,
      type: 'income',
      category,
      amount: Number(amount),
      description,
    });
  } catch (err) {
    console.error('Wallet credit failed:', err);
  }
};

const debitWallet = async (societyId, category, amount, description) => {
  let wallet = await SocietyWallet.findOne({ societyId });
  if (!wallet) {
    wallet = await SocietyWallet.create({ societyId, balance: 0 });
  }

  const debitAmount = Number(amount);

  // Overdraft safeguard: reject if insufficient funds
  if (wallet.balance < debitAmount) {
    const err = new Error(
      `Insufficient wallet balance. Available: ₹${wallet.balance.toFixed(2)}, Requested: ₹${debitAmount.toFixed(2)}`
    );
    err.statusCode = 400;
    throw err;
  }

  wallet.balance -= debitAmount;
  wallet.expensesAmount += debitAmount;
  await wallet.save();

  await WalletTransaction.create({
    societyId,
    type: 'expense',
    category,
    amount: debitAmount,
    description,
  });
};

module.exports = { creditWallet, debitWallet };

