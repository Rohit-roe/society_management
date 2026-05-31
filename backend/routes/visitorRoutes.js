const express = require('express');
const router = express.Router();
const {
  getAllVisitors,
  getMyFlatVisitors,
  getPendingApprovals,
  logVisitor,
  approveVisitor,
  rejectVisitor,
  preApproveVisitor,
  verifyVisitorToken,
  getPublicVisitorPass,
  checkoutVisitor,
  checkinVisitor,
} = require('../controllers/visitorController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/public/:token', getPublicVisitorPass);
router.get('/', verifyToken, requireRole(['society_admin', 'security', 'app_admin']), getAllVisitors);
router.get('/flat', verifyToken, requireRole(['resident']), getMyFlatVisitors);
router.get('/pending', verifyToken, requireRole(['resident']), getPendingApprovals);
router.post('/pre-approve', verifyToken, requireRole(['resident']), preApproveVisitor);
router.get('/verify/:token', verifyToken, requireRole(['security']), verifyVisitorToken);
router.post('/', verifyToken, requireRole(['resident', 'security']), logVisitor);
router.patch('/:id/approve', verifyToken, requireRole(['resident']), approveVisitor);
router.patch('/:id/reject', verifyToken, requireRole(['resident']), rejectVisitor);
router.patch('/:id/checkin', verifyToken, requireRole(['security', 'society_admin']), checkinVisitor);
router.patch('/:id/checkout', verifyToken, requireRole(['resident', 'security']), checkoutVisitor);

module.exports = router;
