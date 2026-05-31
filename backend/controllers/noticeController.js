const Notice = require('../models/Notice');
const { notifySocietyUsers } = require('../utils/notifications');

const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ societyId: req.user.societyId })
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createNotice = async (req, res) => {
  try {
    const { title, body, priority } = req.body;
    const notice = await Notice.create({
      societyId: req.user.societyId,
      title,
      body,
      priority: priority || 'normal',
      postedBy: req.user._id,
    });

    const io = req.app.get('io');
    io?.to(String(req.user.societyId)).emit('new-notice', {
      title: notice.title,
      priority: notice.priority,
    });

    await notifySocietyUsers(io, {
      societyId: req.user.societyId,
      roles: ['resident', 'security'],
      title: 'New Notice',
      message: notice.title,
      type: 'notice',
      link: '/notices',
      excludeUserId: req.user._id,
    });

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findOneAndUpdate(
      { _id: req.params.id, societyId: req.user.societyId },
      req.body,
      { new: true }
    );
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    await Notice.findOneAndDelete({ _id: req.params.id, societyId: req.user.societyId });
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
