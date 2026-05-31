const User = require('../models/User');
const Society = require('../models/Society');
const SocietyRequest = require('../models/SocietyRequest');
const ResidentMember = require('../models/ResidentMember');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, societyId, flatNumber } = req.body;

    if (role === 'app_admin' || role === 'society_admin') {
      return res.status(400).json({ message: 'Cannot register with this role directly' });
    }

    const allowedRoles = ['resident', 'security'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const society = await Society.findById(societyId);
    if (!society) return res.status(400).json({ message: 'Society not found' });

    if (role === 'resident') {
      if (!flatNumber) {
        return res.status(400).json({ message: 'Flat number is required for residents' });
      }

      // Check if pre-added by society admin
      const member = await ResidentMember.findOne({
        societyId,
        houseNo: flatNumber,
        name: { $regex: new RegExp("^" + name.trim() + "$", "i") },
      });

      if (!member) {
        return res.status(400).json({
          message: 'Resident details not pre-added by Society Admin. Please contact your admin.',
        });
      }

      if (member.userId) {
        return res.status(400).json({ message: 'This resident entry is already registered' });
      }

      const user = await User.create({
        name: member.name, // use the official name from member record
        email,
        password,
        phone: phone || member.phone,
        role: 'resident',
        societyId,
        flatNumber,
        isActive: false,
        status: 'pending',
      });

      // Temporarily link to user
      member.userId = user._id;
      await member.save();

      return res.status(201).json({
        message: 'Registration request submitted. Awaiting Society Admin approval.',
        status: 'pending',
      });
    } else {
      // Security role registration
      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'security',
        societyId,
        isActive: false,
        status: 'pending',
      });

      return res.status(201).json({
        message: 'Registration request submitted. Awaiting Admin approval.',
        status: 'pending',
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const registerSocietyRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      societyName,
      address,
      city,
      totalFlats,
      estimatedResidents,
      contactNumber,
      proofDocument,
      description,
    } = req.body;

    if (!name || !email || !password || !societyName || !address || !city || !totalFlats) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: 'Email already registered' });

    const societyExists = await Society.findOne({ name: { $regex: new RegExp("^" + societyName.trim() + "$", "i") } });
    if (societyExists) return res.status(400).json({ message: 'A society with this name already exists' });

    const requestExists = await SocietyRequest.findOne({ name: { $regex: new RegExp("^" + societyName.trim() + "$", "i") }, status: 'pending' });
    if (requestExists) return res.status(400).json({ message: 'A pending request already exists for this society name' });

    // Create inactive user with society_admin role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'society_admin',
      isActive: false,
      status: 'pending',
    });

    const societyRequest = await SocietyRequest.create({
      name: societyName,
      address,
      city,
      totalFlats,
      estimatedResidents,
      contactNumber,
      proofDocument,
      description,
      requestedBy: user._id,
    });

    res.status(201).json({
      message: 'Society request submitted successfully. Awaiting platform admin review.',
      requestId: societyRequest._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account registration is pending admin approval.' });
    }

    if (user.status === 'rejected') {
      const request = await SocietyRequest.findOne({ requestedBy: user._id });
      const reason = request?.rejectionReason ? `: ${request.rejectionReason}` : '';
      return res.status(403).json({ message: `Your registration request was rejected${reason}` });
    }

    if (user.status === 'suspended' || !user.isActive) {
      return res.status(403).json({ message: 'Your account has been suspended or deactivated.' });
    }

    if (user.societyId) {
      const society = await Society.findById(user.societyId);
      if (society && society.status === 'suspended') {
        return res.status(403).json({ message: 'Your society has been suspended. Please contact platform admin.' });
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      societyId: user.societyId,
      flatNumber: user.flatNumber,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, registerSocietyRequest, login };
