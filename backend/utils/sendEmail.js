const nodemailer = require('nodemailer');

const canSendEmail = () =>
  process.env.EMAIL_USER && process.env.EMAIL_PASS;

const getTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendVisitorQR = async (guestEmail, guestName, flatNumber, verifyUrl, qrDataUrl) => {
  if (!canSendEmail()) {
    console.warn('Email not configured — skipping visitor QR email');
    return;
  }
  await getTransporter().sendMail({
    from: `Society App <${process.env.EMAIL_USER}>`,
    to: guestEmail,
    subject: `Your Entry Pass — Flat ${flatNumber}`,
    html: `
      <h2>Hello ${guestName},</h2>
      <p>You have been pre-approved to visit Flat ${flatNumber}.</p>
      <p>Show this QR code at the gate:</p>
      <img src="${qrDataUrl}" alt="QR Code" style="width:200px;height:200px" />
      <p><a href="${verifyUrl}">Open entry pass</a></p>
    `,
  });
};

module.exports = { sendVisitorQR };
