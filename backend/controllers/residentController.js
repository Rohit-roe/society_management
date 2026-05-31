const User = require('../models/User');
const ResidentMember = require('../models/ResidentMember');
const AuditLog = require('../models/AuditLog');

// Get all pre-added residents for the society
const getPreAddedResidents = async (req, res) => {
  try {
    const residents = await ResidentMember.find({ societyId: req.user.societyId })
      .populate('userId', 'name email status')
      .sort({ houseNo: 1 });
    res.json(residents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new resident to the pre-added whitelist
const preAddResident = async (req, res) => {
  try {
    const { houseNo, name, phone, email, familyCount, residentType } = req.body;
    if (!houseNo || !name || !residentType) {
      return res.status(400).json({ message: 'House number, Name, and Resident Type are required' });
    }

    const exists = await ResidentMember.findOne({
      societyId: req.user.societyId,
      houseNo,
      name: { $regex: new RegExp("^" + name.trim() + "$", "i") },
    });

    if (exists) {
      return res.status(400).json({ message: 'This resident has already been pre-added for this flat' });
    }

    const member = await ResidentMember.create({
      societyId: req.user.societyId,
      houseNo,
      name: name.trim(),
      phone,
      email,
      familyCount: familyCount || 0,
      residentType,
    });

    await AuditLog.create({
      action: 'RESIDENT_PRE_ADD',
      performedBy: req.user._id,
      details: `Pre-added resident ${name} to flat ${houseNo}`,
      societyId: req.user.societyId,
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending join requests for the society
const getJoinRequests = async (req, res) => {
  try {
    const requests = await User.find({
      societyId: req.user.societyId,
      status: 'pending',
      role: { $in: ['resident', 'security'] },
    }).select('-password');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve resident/security join request
const approveJoinRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    user.status = 'active';
    user.isActive = true;
    await user.save();

    if (user.role === 'resident') {
      const member = await ResidentMember.findOne({
        societyId: user.societyId,
        houseNo: user.flatNumber,
        name: { $regex: new RegExp("^" + user.name + "$", "i") },
      });

      if (member) {
        member.userId = user._id;
        await member.save();
      }
    }

    await AuditLog.create({
      action: 'JOIN_REQUEST_APPROVED',
      performedBy: req.user._id,
      details: `Approved join request for ${user.role}: ${user.name} (Flat: ${user.flatNumber || 'N/A'})`,
      societyId: req.user.societyId,
    });

    res.json({ message: 'Join request approved successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject resident/security join request
const rejectJoinRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Unlink in ResidentMember if linked
    if (user.role === 'resident') {
      const member = await ResidentMember.findOne({ userId: user._id });
      if (member) {
        member.userId = undefined;
        await member.save();
      }
    }

    await User.findByIdAndDelete(user._id);

    await AuditLog.create({
      action: 'JOIN_REQUEST_REJECTED',
      performedBy: req.user._id,
      details: `Rejected & deleted pending join request for ${user.role}: ${user.name}`,
      societyId: req.user.societyId,
    });

    res.json({ message: 'Join request rejected and deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Transfer admin privilege to another resident
const transferAdminPrivilege = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'Target user ID required' });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'Target user not found' });

    if (targetUser.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'Target user is not in your society' });
    }

    if (targetUser.role !== 'resident' || targetUser.status !== 'active') {
      return res.status(400).json({ message: 'Target user must be an active resident' });
    }

    // Perform transfer
    targetUser.role = 'society_admin';
    await targetUser.save();

    // Demote self
    const currentUser = await User.findById(req.user._id);
    currentUser.role = 'resident';
    await currentUser.save();

    await AuditLog.create({
      action: 'ADMIN_PRIVILEGE_TRANSFER',
      performedBy: req.user._id,
      details: `Transferred admin privilege from ${currentUser.name} (demoted to resident) to ${targetUser.name} (promoted to society_admin)`,
      societyId: req.user.societyId,
    });

    res.json({
      message: 'Admin privilege transferred successfully. You are now demoted to Resident.',
      newRole: 'resident',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAuditLogsForSociety = async (req, res) => {
  try {
    const logs = await AuditLog.find({ societyId: req.user.societyId })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFamilyMembers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('familyMembers');
    res.json(user.familyMembers || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addFamilyMember = async (req, res) => {
  try {
    const { name, relation, phone, isEmergencyContact } = req.body;
    if (!name || !relation) {
      return res.status(400).json({ message: 'Name and relation are required' });
    }

    const user = await User.findById(req.user._id);
    user.familyMembers.push({ name, relation, phone, isEmergencyContact });
    await user.save();

    res.status(201).json(user.familyMembers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFamilyMember = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.familyMembers.pull({ _id: req.params.memberId });
    await user.save();
    res.json(user.familyMembers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
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
};
