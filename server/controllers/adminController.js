const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Response = require('../models/Response');
const Match = require('../models/Match');
const Handover = require('../models/Handover');
const AuditLog = require('../models/AuditLog');
const CollegeRoster = require('../models/CollegeRoster');
const { createNotification } = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get complete admin dashboard analytics & metrics
 * @route   GET /api/v1/admin/dashboard
 * @access  Private (Admin)
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalRegisteredStudents,
      activeStudents,
      pendingStudentRegistrations,
      totalLostReports,
      totalFoundReports,
      totalResponses,
      pendingVerifications,
      scheduledHandovers,
      successfullyReturned,
      recentLost,
      recentFound,
      recentResponses,
      recentHandovers,
      categoryDistribution,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', accountStatus: 'ACTIVE' }),
      User.countDocuments({ role: 'student', accountStatus: 'PENDING_APPROVAL' }),
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      Response.countDocuments(),
      Match.countDocuments({ matchStatus: 'UNDER_VERIFICATION' }),
      Handover.countDocuments({ status: 'SCHEDULED' }),
      Handover.countDocuments({ status: 'COMPLETED' }),
      LostItem.find()
        .populate('studentId', 'name collegeId department phone email')
        .sort({ createdAt: -1 })
        .limit(5),
      FoundItem.find()
        .populate('studentId', 'name collegeId department phone email')
        .sort({ createdAt: -1 })
        .limit(5),
      Response.find()
        .populate('lostItemId', 'itemName category')
        .populate('responderId', 'name collegeId department')
        .sort({ createdAt: -1 })
        .limit(5),
      Handover.find({ status: 'COMPLETED' })
        .populate('lostItemId', 'itemName')
        .populate('ownerId', 'name collegeId')
        .populate('finderId', 'name collegeId')
        .sort({ handedOverAt: -1 })
        .limit(5),
      LostItem.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    // Monthly trends (grouping by year-month)
    const monthlyTrends = await LostItem.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          lostCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    return sendSuccess(res, 200, 'Admin dashboard metrics retrieved.', {
      stats: {
        totalRegisteredStudents,
        activeStudents,
        pendingStudentRegistrations,
        totalLostReports,
        totalFoundReports,
        totalResponses,
        pendingReviews: await LostItem.countDocuments({ status: 'UNDER_REVIEW' }),
        potentialMatches: await Match.countDocuments(),
        pendingVerifications,
        scheduledHandovers,
        successfullyReturned,
      },
      recentLost,
      recentFound,
      recentResponses,
      recentHandovers,
      categoryDistribution,
      monthlyTrends,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all students with search & filter
 * @route   GET /api/v1/admin/students
 * @access  Private (Admin)
 */
const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const query = { role: 'student' };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { collegeId: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
      ];
    }

    if (req.query.department && req.query.department !== 'All') {
      query.department = req.query.department;
    }

    if (req.query.status && req.query.status !== 'All') {
      query.accountStatus = req.query.status;
    }

    if (req.query.academicYear && req.query.academicYear !== 'All') {
      query.academicYear = req.query.academicYear;
    }

    const [students, totalRecords] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Students list retrieved.', {
      students,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update student account status (approve, activate, deactivate)
 * @route   PATCH /api/v1/admin/students/:id/status
 * @access  Private (Admin)
 */
const updateStudentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['ACTIVE', 'PENDING_APPROVAL', 'DEACTIVATED'].includes(status)) {
      return sendError(res, 400, 'Invalid account status value.');
    }

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return sendError(res, 404, 'Student account not found.');
    }

    const oldStatus = student.accountStatus;
    student.accountStatus = status;

    if (status === 'ACTIVE') {
      student.isCollegeVerified = true;
    }

    await student.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: status === 'ACTIVE' ? 'STUDENT_APPROVED' : 'STUDENT_STATUS_UPDATED',
      entityType: 'User',
      entityId: student._id,
      description: `Admin changed student ${student.name} (${student.collegeId}) status from ${oldStatus} to ${status}.`,
    });

    // Notify student
    await createNotification({
      recipientId: student._id,
      title: status === 'ACTIVE' ? 'Account Approved!' : 'Account Status Updated',
      message:
        status === 'ACTIVE'
          ? 'Your CampusConnect student account has been approved and activated. You can now access all features!'
          : `Your account status has been changed to ${status}. Please contact college administration if you have questions.`,
      type: 'ADMIN_REVIEWED',
      relatedEntityType: 'System',
      relatedEntityId: student._id,
    });

    return sendSuccess(res, 200, `Student account status updated to ${status}.`, student.toSafeObject());
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Import authorized college student roster via CSV / JSON
 * @route   POST /api/v1/admin/roster/import
 * @access  Private (Admin)
 */
const importCollegeRoster = async (req, res, next) => {
  try {
    const { records } = req.body; // Array of { collegeId, name, email, department, academicYear }

    if (!Array.isArray(records) || records.length === 0) {
      return sendError(res, 400, 'Please provide an array of student roster records.');
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of records) {
      if (!item.collegeId || !item.name || !item.email) continue;

      const normalizedCollegeId = item.collegeId.trim().toUpperCase();
      const normalizedEmail = item.email.trim().toLowerCase();

      const result = await CollegeRoster.findOneAndUpdate(
        { collegeId: normalizedCollegeId },
        {
          name: item.name.trim(),
          email: normalizedEmail,
          department: (item.department || 'General').trim(),
          academicYear: (item.academicYear || '1st Year').trim(),
          verificationStatus: 'VERIFIED',
          isDemonstration: !!item.isDemonstration,
          importedAt: new Date(),
        },
        { upsert: true, new: true, rawResult: true }
      );

      if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
        updatedCount++;
      } else {
        insertedCount++;
      }
    }

    await AuditLog.create({
      adminId: req.user._id,
      action: 'ROSTER_IMPORTED',
      entityType: 'CollegeRoster',
      description: `Admin imported college roster: ${insertedCount} new records inserted, ${updatedCount} records updated.`,
    });

    return sendSuccess(res, 200, 'College roster imported successfully.', {
      insertedCount,
      updatedCount,
      totalProcessed: records.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all lost items (Admin view with complete private details)
 * @route   GET /api/v1/admin/lost-items
 * @access  Private (Admin)
 */
const getAllLostItemsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ itemName: searchRegex }, { description: searchRegex }, { lastSeenLocation: searchRegex }];
    }

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const [items, totalRecords] = await Promise.all([
      LostItem.find(query)
        .populate('studentId', 'name collegeId department phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LostItem.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Admin lost items retrieved.', {
      items,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update lost item by admin (status, remarks, close with reason)
 * @route   PATCH /api/v1/admin/lost-items/:id
 * @access  Private (Admin)
 */
const updateLostItemAdmin = async (req, res, next) => {
  try {
    const { status, adminRemarks, closedReason } = req.body;

    const lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) {
      return sendError(res, 404, 'Lost item report not found.');
    }

    if (status) lostItem.status = status;
    if (adminRemarks !== undefined) lostItem.adminRemarks = adminRemarks.trim();
    if (closedReason !== undefined) lostItem.closedReason = closedReason.trim();

    await lostItem.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: 'LOST_ITEM_ADMIN_UPDATE',
      entityType: 'LostItem',
      entityId: lostItem._id,
      description: `Admin updated lost item "${lostItem.itemName}" to status ${lostItem.status}.`,
    });

    return sendSuccess(res, 200, 'Lost item report updated.', lostItem);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all found items (Admin view with complete private details)
 * @route   GET /api/v1/admin/found-items
 * @access  Private (Admin)
 */
const getAllFoundItemsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ itemName: searchRegex }, { description: searchRegex }, { foundLocation: searchRegex }];
    }

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    if (req.query.possessionStatus && req.query.possessionStatus !== 'All') {
      query.possessionStatus = req.query.possessionStatus;
    }

    const [items, totalRecords] = await Promise.all([
      FoundItem.find(query)
        .populate('studentId', 'name collegeId department phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FoundItem.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Admin found items retrieved.', {
      items,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update found item by admin (record deposit, update status/remarks)
 * @route   PATCH /api/v1/admin/found-items/:id
 * @access  Private (Admin)
 */
const updateFoundItemAdmin = async (req, res, next) => {
  try {
    const { status, possessionStatus, adminRemarks, closedReason } = req.body;

    const foundItem = await FoundItem.findById(req.params.id);
    if (!foundItem) {
      return sendError(res, 404, 'Found item report not found.');
    }

    if (status) foundItem.status = status;
    if (possessionStatus) foundItem.possessionStatus = possessionStatus;
    if (adminRemarks !== undefined) foundItem.adminRemarks = adminRemarks.trim();
    if (closedReason !== undefined) foundItem.closedReason = closedReason.trim();

    await foundItem.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: 'FOUND_ITEM_ADMIN_UPDATE',
      entityType: 'FoundItem',
      entityId: foundItem._id,
      description: `Admin updated found item "${foundItem.itemName}". Status: ${foundItem.status}, Possession: ${foundItem.possessionStatus}.`,
    });

    return sendSuccess(res, 200, 'Found item updated successfully.', foundItem);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all responses for admin review
 * @route   GET /api/v1/admin/responses
 * @access  Private (Admin)
 */
const getAllResponsesAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const [responses, totalRecords] = await Promise.all([
      Response.find(query)
        .populate({
          path: 'lostItemId',
          populate: { path: 'studentId', select: 'name collegeId department phone email' },
        })
        .populate('foundItemId')
        .populate('responderId', 'name collegeId department phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Response.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Admin responses retrieved.', {
      responses,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update response by admin (Accept for matching, reject, add remarks)
 * @route   PATCH /api/v1/admin/responses/:id
 * @access  Private (Admin)
 */
const updateResponseAdmin = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;

    const response = await Response.findById(req.params.id)
      .populate('lostItemId')
      .populate('responderId');

    if (!response) {
      return sendError(res, 404, 'Response record not found.');
    }

    if (status) response.status = status;
    if (adminRemarks !== undefined) response.adminRemarks = adminRemarks.trim();

    await response.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: status === 'REJECTED' ? 'RESPONSE_REJECTED' : 'RESPONSE_REVIEWED',
      entityType: 'Response',
      entityId: response._id,
      description: `Admin updated response status to ${status}. Remarks: ${adminRemarks || 'None'}.`,
    });

    // Notify responder
    await createNotification({
      recipientId: response.responderId._id,
      title: `Response ${status}`,
      message: `Your response for lost item "${response.lostItemId.itemName}" was marked as ${status} by admin. ${adminRemarks ? 'Remarks: ' + adminRemarks : ''}`,
      type: 'ADMIN_REVIEWED',
      relatedEntityType: 'Response',
      relatedEntityId: response._id,
    });

    return sendSuccess(res, 200, 'Response updated.', response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/v1/admin/audit-logs
 * @access  Private (Admin)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.action && req.query.action !== 'All') {
      query.action = req.query.action;
    }
    if (req.query.entityType && req.query.entityType !== 'All') {
      query.entityType = req.query.entityType;
    }

    const [logs, totalRecords] = await Promise.all([
      AuditLog.find(query).populate('adminId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Audit logs retrieved.', {
      logs,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get comprehensive analytics & reporting data
 * @route   GET /api/v1/admin/analytics
 * @access  Private (Admin)
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalLost,
      totalFound,
      totalReturned,
      categoryStats,
      departmentStats,
      monthlyStats,
      completedHandovers,
    ] = await Promise.all([
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      LostItem.countDocuments({ status: 'RETURNED' }),
      LostItem.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: '$department', studentCount: { $sum: 1 } } },
      ]),
      LostItem.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            lostCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Handover.find({ status: 'COMPLETED' }),
    ]);

    // Calculate return rate
    const returnRate = totalLost > 0 ? Math.round((totalReturned / totalLost) * 100) : 0;

    // Average days to return
    let averageDaysToReturn = 0;
    if (completedHandovers.length > 0) {
      const totalHours = completedHandovers.reduce((acc, h) => {
        const diff = (new Date(h.handedOverAt).getTime() - new Date(h.createdAt).getTime()) / (1000 * 60 * 60);
        return acc + Math.max(diff, 1);
      }, 0);
      averageDaysToReturn = +(totalHours / completedHandovers.length / 24).toFixed(1);
    }

    return sendSuccess(res, 200, 'Analytics report generated.', {
      metrics: {
        totalLost,
        totalFound,
        totalReturned,
        returnRate,
        averageDaysToReturn,
      },
      categoryStats,
      departmentStats,
      monthlyStats,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getStudents,
  updateStudentStatus,
  importCollegeRoster,
  getAllLostItemsAdmin,
  updateLostItemAdmin,
  getAllFoundItemsAdmin,
  updateFoundItemAdmin,
  getAllResponsesAdmin,
  updateResponseAdmin,
  getAuditLogs,
  getAnalytics,
};

