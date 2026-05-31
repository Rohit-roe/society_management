const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const { notifySocietyUsers } = require('../utils/notifications');

// Get all tickets based on roles
const getTickets = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'resident') {
      // Resident sees their own tickets
      filter = { residentId: req.user._id };
    } else if (req.user.role === 'society_admin' || req.user.role === 'security') {
      // Society Admin / Security sees tickets for their society
      filter = { societyId: req.user.societyId };
    } else if (req.user.role === 'app_admin') {
      // App Admin sees all tickets across all societies
      filter = {};
    }

    const tickets = await SupportTicket.find(filter)
      .populate('residentId', 'name flatNumber email phone')
      .populate('raisedBy', 'name flatNumber email phone')
      .populate('assignedTo', 'name role')
      .populate('societyId', 'name city')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new support ticket manually
const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority, attachment } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and Description are required' });
    }

    const io = req.app.get('io');

    const ticket = await SupportTicket.create({
      societyId: req.user.societyId,
      residentId: req.user._id,
      raisedBy: req.user._id,
      flatNumber: req.user.flatNumber,
      title,
      subject: title, // maintain compatibility
      description,
      category: category || 'custom',
      priority: priority || 'medium',
      attachment,
      status: 'open',
      source: 'manual',
    });

    // Notify admins
    await notifySocietyUsers(io, {
      societyId: req.user.societyId,
      roles: ['society_admin'],
      title: 'New Support Ticket',
      message: `${req.user.name} (Flat ${req.user.flatNumber}) raised a complaint: "${title}"`,
      type: 'system',
      link: '/admin/support',
      excludeUserId: req.user._id,
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update status of support ticket
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['open', 'in_progress', 'resolved', 'closed', 'escalated'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const io = req.app.get('io');
    let query = { _id: req.params.id };

    // Residents can only close their own tickets
    if (req.user.role === 'resident') {
      query.residentId = req.user._id;
      if (status !== 'closed') {
        return res.status(403).json({ message: 'Residents can only close their own tickets' });
      }
    } else if (req.user.role === 'society_admin') {
      // Society Admin is scoped to their society
      query.societyId = req.user.societyId;
    }

    const ticket = await SupportTicket.findOneAndUpdate(
      query,
      { status },
      { new: true }
    ).populate('residentId', 'name email');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found or unauthorized' });

    // Notify resident if admin updated it
    if (req.user.role === 'society_admin' || req.user.role === 'app_admin') {
      await notifySocietyUsers(io, {
        societyId: ticket.societyId,
        roles: ['resident'],
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticket.title}" status is now "${status}".`,
        type: 'system',
        link: '/support/my',
        userIds: [ticket.residentId._id],
      });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign ticket to a staff member
const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body; // user ID of guard or staff
    const ticket = await SupportTicket.findOne({ _id: req.params.id, societyId: req.user.societyId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    let staff = null;
    if (assignedTo) {
      staff = await User.findById(assignedTo);
      if (!staff || staff.societyId.toString() !== req.user.societyId.toString()) {
        return res.status(400).json({ message: 'Invalid staff assignment' });
      }
    }

    ticket.assignedTo = assignedTo || null;
    await ticket.save();

    const updated = await SupportTicket.findById(ticket._id)
      .populate('residentId', 'name')
      .populate('assignedTo', 'name role');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTicketFromChat = async (io, user, message) => {
  const subject = `Support: ${message.slice(0, 80)}${message.length > 80 ? '...' : ''}`;
  const ticket = await SupportTicket.create({
    societyId: user.societyId,
    residentId: user._id,
    raisedBy: user._id,
    flatNumber: user.flatNumber,
    title: subject,
    subject,
    description: message,
    category: 'custom',
    priority: 'medium',
    status: 'open',
    source: 'chatbot',
  });

  await notifySocietyUsers(io, {
    societyId: user.societyId,
    roles: ['society_admin'],
    title: 'New Support Ticket',
    message: `${user.name} (Flat ${user.flatNumber}) raised a complaint via Chatbot.`,
    type: 'system',
    link: '/admin/support',
    excludeUserId: user._id,
  });

  return ticket;
};

module.exports = {
  getTickets,
  createTicket,
  updateTicketStatus,
  assignTicket,
  createTicketFromChat,
};
