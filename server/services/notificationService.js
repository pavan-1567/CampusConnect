const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a single in-app notification
 */
const createNotification = async ({
  recipientId,
  title,
  message,
  type,
  relatedEntityType = 'System',
  relatedEntityId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      title,
      message,
      type,
      relatedEntityType,
      relatedEntityId,
    });
    return notification;
  } catch (err) {
    console.error('[NotificationService] Error creating notification:', err.message);
    return null;
  }
};

/**
 * Notify all active admins
 */
const notifyAllAdmins = async ({
  title,
  message,
  type,
  relatedEntityType = 'System',
  relatedEntityId = null,
}) => {
  try {
    const admins = await User.find({ role: 'admin', accountStatus: 'ACTIVE' }).select('_id');
    const promises = admins.map((admin) =>
      Notification.create({
        recipientId: admin._id,
        title,
        message,
        type,
        relatedEntityType,
        relatedEntityId,
      })
    );
    await Promise.all(promises);
  } catch (err) {
    console.error('[NotificationService] Error notifying admins:', err.message);
  }
};

module.exports = {
  createNotification,
  notifyAllAdmins,
};

