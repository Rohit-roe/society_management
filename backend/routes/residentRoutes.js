const express = require('express');
const router = express.Router();
const {
  getPreAddedResidents,
  preAddResident,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  transferAdminPrivilege,
  getAuditLogsForSociety,
  getFamilyMembers,
  addFamilyMember,
  deleteFamilyMember,
} = require('../controllers/residentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Resident Family Routes (verifyToken only, restricted to residents)
router.get('/family', verifyToken, requireRole(['resident']), getFamilyMembers);
router.post('/family', verifyToken, requireRole(['resident']), addFamilyMember);
router.delete('/family/:memberId', verifyToken, requireRole(['resident']), deleteFamilyMember);

// Secure subsequent routes under Society Admin
router.use(verifyToken, requireRole(['society_admin']));

router.get('/pre-added', getPreAddedResidents);
router.post('/pre-add', preAddResident);
router.get('/requests', getJoinRequests);
router.post('/requests/:id/approve', approveJoinRequest);
router.post('/requests/:id/reject', rejectJoinRequest);
router.post('/transfer-admin', transferAdminPrivilege);
router.get('/audit-logs', getAuditLogsForSociety);

module.exports = router;
