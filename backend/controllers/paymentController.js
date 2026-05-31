const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Maintenance = require('../models/Maintenance');
const { completePayment } = require('../utils/paymentHelpers');

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.includes('xxxx') || keySecret.includes('here')) {
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const { maintenanceId } = req.body;
    const record = await Maintenance.findOne({
      _id: maintenanceId,
      societyId: req.user.societyId,
      flatNumber: req.user.flatNumber,
    });
    if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
    if (record.status === 'paid') return res.status(400).json({ message: 'Already paid' });

    if (!razorpay) {
      const mockOrderId = `mock_order_${Date.now()}`;
      await Payment.create({
        societyId: req.user.societyId,
        residentId: req.user._id,
        maintenanceId,
        razorpayOrderId: mockOrderId,
        amount: record.amount * 100,
        status: 'created',
      });
      return res.json({
        orderId: mockOrderId,
        amount: record.amount * 100,
        currency: 'INR',
        keyId: 'mock_key_id',
        isMock: true,
      });
    }

    const order = await razorpay.orders.create({
      amount: record.amount * 100,
      currency: 'INR',
      receipt: `receipt_${maintenanceId}`,
    });

    await Payment.create({
      societyId: req.user.societyId,
      residentId: req.user._id,
      maintenanceId,
      razorpayOrderId: order.id,
      amount: record.amount * 100,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (razorpay_order_id && razorpay_order_id.startsWith('mock_order_')) {
      const io = req.app.get('io');
      const result = await completePayment(io, {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id || `mock_pay_${Date.now()}`,
        razorpaySignature: razorpay_signature || 'mock_sig',
      });
      if (!result) return res.status(404).json({ message: 'Payment record not found' });
      return res.json({ message: 'Mock payment verified and recorded successfully' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const io = req.app.get('io');
    const result = await completePayment(io, {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!result) return res.status(404).json({ message: 'Payment record not found' });

    res.json({ message: 'Payment verified and recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/webhook — Razorpay server callback (raw body)
const paymentWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(503).json({ message: 'Webhook secret not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;
    const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody);

    const expected = crypto.createHmac('sha256', webhookSecret).update(bodyString).digest('hex');

    if (signature !== expected) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const payload = JSON.parse(bodyString);
    const event = payload.event;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId && paymentId) {
        const io = req.app.get('io');
        await completePayment(io, {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        });
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, paymentWebhook };
