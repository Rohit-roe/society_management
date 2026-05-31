const Notification = require('../models/Notification');
const User = require('../models/User');

const sendNotification = async (io, { userId, societyId, title, message, type, link, priority }) => {
  const notification = await Notification.create({
    userId,
    societyId,
    title,
    message,
    type,
    link,
    priority: priority || 'normal',
  });

  if (io && userId) {
    io.to(String(userId)).emit('new_notification', notification);
  }

  return notification;
};

const notifySocietyUsers = async (
  io,
  { societyId, roles, title, message, type, link, excludeUserId, priority }
) => {
  const filter = { societyId, isActive: true };
  if (roles?.length) filter.role = { $in: roles };
  const users = await User.find(filter).select('_id');

  return Promise.all(
    users
      .filter((u) => String(u._id) !== String(excludeUserId))
      .map((u) =>
        sendNotification(io, {
          userId: u._id,
          societyId,
          title,
          message,
          type,
          link,
          priority,
        })
      )
  );
};

module.exports = { sendNotification, notifySocietyUsers };
