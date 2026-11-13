const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Response = require('../models/Response');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Update student profile (permitted fields only)
 * @route   PATCH /api/v1/users/profile
 * @access  Private (Student)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, academicYear } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (department) user.department = department.trim();
    if (academicYear) user.academicYear = academicYear.trim();

    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get student personal dashboard stats and recent activity
 * @route   GET /api/v1/users/dashboard
 * @access  Private (Student)
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Run parallel count queries
    const [
      totalLostSubmitted,
      totalFoundSubmitted,
      totalReturned,
      recentLost,
      recentFound,
      unreadNotificationsCount,
    ] = await Promise.all([
      LostItem.countDocuments({ studentId }),
      FoundItem.countDocuments({ studentId }),
      LostItem.countDocuments({ studentId, status: 'RETURNED' }),
      LostItem.find({ studentId }).sort({ createdAt: -1 }).limit(5),
      FoundItem.find({ studentId }).sort({ createdAt: -1 }).limit(5),
      Notification.countDocuments({ recipientId: studentId, isRead: false }),
    ]);

    // Count total responses received for this student's lost items
    const myLostItemIds = await LostItem.find({ studentId }).select('_id');
    const lostIds = myLostItemIds.map((item) => item._id);
    const totalResponsesReceived = await Response.countDocuments({
      lostItemId: { $in: lostIds },
    });

    return sendSuccess(res, 200, 'Student dashboard stats loaded', {
      stats: {
        totalLostSubmitted,
        totalFoundSubmitted,
        totalResponsesReceived,
        totalReturned,
        unreadNotificationsCount,
      },
      recentActivity: {
        recentLost,
        recentFound,
      },
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateProfile,
  getStudentDashboard,
};

