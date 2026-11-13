const LostItem = require('../models/LostItem');
const Response = require('../models/Response');
const { processUploadedImage } = require('../middleware/uploadMiddleware');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { notifyAllAdmins } = require('../services/notificationService');

/**
 * @desc    Submit a new lost item report
 * @route   POST /api/v1/lost-items
 * @access  Private (Student)
 */
const createLostItem = async (req, res, next) => {
  try {
    const {
      itemName,
      category,
      description,
      lastSeenLocation,
      lostDate,
      lostTime,
      identifyingDetails,
      contactNumber,
    } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = await processUploadedImage(req.file);
    }

    const lostItem = await LostItem.create({
      studentId: req.user._id,
      itemName: itemName.trim(),
      category,
      description: description.trim(),
      lastSeenLocation: lastSeenLocation.trim(),
      lostDate,
      lostTime: lostTime ? lostTime.trim() : '',
      image: imageUrl,
      identifyingDetails: identifyingDetails ? identifyingDetails.trim() : '',
      contactNumber: contactNumber ? contactNumber.trim() : req.user.phone,
      status: 'OPEN',
    });

    // Notify administrators
    await notifyAllAdmins({
      title: 'New Lost Item Reported',
      message: `Student ${req.user.name} reported a lost ${lostItem.itemName} (${lostItem.category}) at ${lostItem.lastSeenLocation}.`,
      type: 'REPORT_SUBMITTED',
      relatedEntityType: 'LostItem',
      relatedEntityId: lostItem._id,
    });

    return sendSuccess(res, 201, 'Lost item report submitted successfully.', lostItem);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Browse lost items (server-side search, filtering, pagination)
 * @route   GET /api/v1/lost-items
 * @access  Public / Authenticated
 */
const getLostItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    // Search by item name or description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ itemName: searchRegex }, { description: searchRegex }, { lastSeenLocation: searchRegex }];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    // Location filter
    if (req.query.location) {
      query.lastSeenLocation = new RegExp(req.query.location.trim(), 'i');
    }

    // Status filter - by default exclude CLOSED and RETURNED unless explicitly requested
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    } else if (!req.query.status) {
      query.status = { $in: ['OPEN', 'UNDER_REVIEW', 'MATCHED', 'VERIFICATION_PENDING'] };
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.lostDate = {};
      if (req.query.startDate) query.lostDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.lostDate.$lte = new Date(req.query.endDate);
    }

    const totalRecords = await LostItem.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Exclude private identifyingDetails and contactNumber in public listings
    const items = await LostItem.find(query)
      .select('-identifyingDetails -contactNumber')
      .populate('studentId', 'name department academicYear')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, 'Lost items retrieved.', {
      items,
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get lost items submitted by current student
 * @route   GET /api/v1/lost-items/my
 * @access  Private (Student)
 */
const getMyLostItems = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const items = await LostItem.find({ studentId }).sort({ createdAt: -1 });

    // Attach response counts for each item
    const itemIds = items.map((i) => i._id);
    const responseCounts = await Response.aggregate([
      { $match: { lostItemId: { $in: itemIds } } },
      { $group: { _id: '$lostItemId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    responseCounts.forEach((r) => {
      countMap[r._id.toString()] = r.count;
    });

    const itemsWithCounts = items.map((item) => {
      const obj = item.toObject();
      obj.responseCount = countMap[item._id.toString()] || 0;
      return obj;
    });

    return sendSuccess(res, 200, 'My lost items retrieved.', itemsWithCounts);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single lost item by ID
 * @route   GET /api/v1/lost-items/:id
 * @access  Public / Authenticated
 */
const getLostItemById = async (req, res, next) => {
  try {
    const lostItem = await LostItem.findById(req.params.id).populate(
      'studentId',
      'name department academicYear email phone'
    );

    if (!lostItem) {
      return sendError(res, 404, 'Lost item report not found.');
    }

    // Check if requester is the owner or an admin
    const isOwner = req.user && req.user._id.toString() === lostItem.studentId._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    let itemData = lostItem.toObject();

    // If neither owner nor admin, protect private identifying details and contact number
    if (!isOwner && !isAdmin) {
      delete itemData.identifyingDetails;
      delete itemData.contactNumber;
      if (itemData.studentId) {
        delete itemData.studentId.phone;
        delete itemData.studentId.email;
      }
    }

    // If owner or admin, also include response count
    const responseCount = await Response.countDocuments({ lostItemId: lostItem._id });
    itemData.responseCount = responseCount;

    return sendSuccess(res, 200, 'Lost item details retrieved.', itemData);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update eligible lost item report
 * @route   PATCH /api/v1/lost-items/:id
 * @access  Private (Owner)
 */
const updateLostItem = async (req, res, next) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);

    if (!lostItem) {
      return sendError(res, 404, 'Lost item report not found.');
    }

    if (lostItem.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You are not authorized to edit this report.');
    }

    if (!['OPEN', 'UNDER_REVIEW'].includes(lostItem.status) && req.user.role !== 'admin') {
      return sendError(res, 400, `Cannot edit report when status is ${lostItem.status}.`);
    }

    const {
      itemName,
      category,
      description,
      lastSeenLocation,
      lostDate,
      lostTime,
      identifyingDetails,
      contactNumber,
    } = req.body;

    if (itemName) lostItem.itemName = itemName.trim();
    if (category) lostItem.category = category;
    if (description) lostItem.description = description.trim();
    if (lastSeenLocation) lostItem.lastSeenLocation = lastSeenLocation.trim();
    if (lostDate) lostItem.lostDate = lostDate;
    if (lostTime !== undefined) lostItem.lostTime = lostTime.trim();
    if (identifyingDetails !== undefined) lostItem.identifyingDetails = identifyingDetails.trim();
    if (contactNumber !== undefined) lostItem.contactNumber = contactNumber.trim();

    if (req.file) {
      lostItem.image = await processUploadedImage(req.file);
    }

    await lostItem.save();

    return sendSuccess(res, 200, 'Lost item updated successfully.', lostItem);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Cancel eligible lost item report
 * @route   PATCH /api/v1/lost-items/:id/cancel
 * @access  Private (Owner)
 */
const cancelLostItem = async (req, res, next) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);

    if (!lostItem) {
      return sendError(res, 404, 'Lost item report not found.');
    }

    if (lostItem.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You are not authorized to cancel this report.');
    }

    if (!['OPEN', 'UNDER_REVIEW'].includes(lostItem.status)) {
      return sendError(res, 400, `Cannot cancel report that is currently ${lostItem.status}.`);
    }

    lostItem.status = 'CLOSED';
    lostItem.closedReason = req.body.reason || 'Cancelled by student owner.';
    await lostItem.save();

    return sendSuccess(res, 200, 'Lost item report has been cancelled.', lostItem);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createLostItem,
  getLostItems,
  getMyLostItems,
  getLostItemById,
  updateLostItem,
  cancelLostItem,
};

