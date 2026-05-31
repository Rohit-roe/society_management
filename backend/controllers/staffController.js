const Staff = require('../models/Staff');

const getStaffMembers = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'app_admin') {
      filter = { societyId: req.user.societyId };
    } else if (req.query.societyId) {
      filter = { societyId: req.query.societyId };
    }

    const staff = await Staff.find(filter);
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createStaffMember = async (req, res) => {
  try {
    const { name, role, phone, salary } = req.body;
    if (!name || !role || !salary) {
      return res.status(400).json({ message: 'Name, role, and salary are required' });
    }

    const member = await Staff.create({
      societyId: req.user.societyId,
      name,
      role,
      phone,
      salary,
      status: 'active',
      attendance: [],
      tasks: [],
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStaffMember = async (req, res) => {
  try {
    const { name, role, phone, salary, status } = req.body;
    const member = await Staff.findOneAndUpdate(
      { _id: req.params.id, societyId: req.user.societyId },
      { name, role, phone, salary, status },
      { new: true }
    );
    if (!member) return res.status(404).json({ message: 'Staff member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logStaffAttendance = async (req, res) => {
  try {
    const { date, status } = req.body;
    if (!date || !status) {
      return res.status(400).json({ message: 'Date and status are required' });
    }

    const staffDate = new Date(date);
    staffDate.setHours(0, 0, 0, 0);

    const member = await Staff.findOne({
      _id: req.params.id,
      societyId: req.user.societyId,
    });
    if (!member) return res.status(404).json({ message: 'Staff member not found' });

    const index = member.attendance.findIndex(
      (a) => new Date(a.date).toDateString() === staffDate.toDateString()
    );

    if (index !== -1) {
      member.attendance[index].status = status;
    } else {
      member.attendance.push({ date: staffDate, status });
    }

    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignStaffTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const member = await Staff.findOneAndUpdate(
      { _id: req.params.id, societyId: req.user.societyId },
      { $push: { tasks: { title, description, dueDate: dueDate ? new Date(dueDate) : null } } },
      { new: true }
    );
    if (!member) return res.status(404).json({ message: 'Staff member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStaffTaskStatus = async (req, res) => {
  try {
    const { status } = req.body; // pending, in_progress, completed
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const member = await Staff.findOne({
      _id: req.params.id,
      societyId: req.user.societyId,
    });
    if (!member) return res.status(404).json({ message: 'Staff member not found' });

    const task = member.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStaffMembers,
  createStaffMember,
  updateStaffMember,
  logStaffAttendance,
  assignStaffTask,
  updateStaffTaskStatus,
};
