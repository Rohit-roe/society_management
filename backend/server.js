const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { paymentWebhook } = require('./controllers/paymentController');
const { startVisitorScheduler } = require('./utils/visitorScheduler');

dotenv.config();
connectDB();


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);
require('./socket/socketHandler')(io);

app.use(cors());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Razorpay webhook must use raw body (before express.json())
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentWebhook
);

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/societies', require('./routes/societyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/visitors', require('./routes/visitorRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chatbotRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/support', require('./routes/supportTicketRoutes'));

// New Governance Features
app.use('/api/app-admin', require('./routes/appAdminRoutes'));
app.use('/api/residents', require('./routes/residentRoutes'));
app.use('/api/finances', require('./routes/financeRoutes'));
app.use('/api/voting', require('./routes/votingRoutes'));
app.use('/api/vault', require('./routes/vaultRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/penalties', require('./routes/penaltyRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/security-shifts', require('./routes/securityShiftRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
  startVisitorScheduler();
});

