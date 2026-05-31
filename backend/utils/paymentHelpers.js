const Payment = require('../models/Payment');
const Maintenance = require('../models/Maintenance');
const { sendNotification } = require('./notifications');

const completePayment = async (io, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId, status: { $ne: 'paid' } },
    {
      razorpayPaymentId,
      razorpaySignature,
      status: 'paid',
    },
    { new: true }
  );

  if (!payment) return null;

  const record = await Maintenance.findByIdAndUpdate(
    payment.maintenanceId,
    { status: 'paid', paidOn: new Date(), updatedBy: payment.residentId },
    { new: true }
  );

  if (record) {
    const { creditWallet } = require('./financeHelper');
    await creditWallet(
      payment.societyId,
      'maintenance',
      payment.amount / 100,
      `Maintenance payment (online) for Flat ${record.flatNumber}`
    );
  }

  if (io && record) {
    io.to(String(payment.societyId)).emit('payment-received', {
      flatNumber: record.flatNumber,
      amount: record.amount,
    });
    await sendNotification(io, {
      userId: payment.residentId,
      societyId: payment.societyId,
      title: 'Payment Successful',
      message: `Maintenance for flat ${record.flatNumber} has been paid.`,
      type: 'payment',
      link: '/maintenance/my',
    });
  }

  return { payment, record };
};

module.exports = { completePayment };
