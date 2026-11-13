const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const { processUploadedImage } = require('../middleware/uploadMiddleware');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { notifyAllAdmins } = require('../services/notificationService');

/**
 * @desc    Submit a new found item report
 * @route   POST /api/v1/found-items
 * @access  Private (Student)
 */
const createFoundItem = async (req, res, next) => {
  try {
    const {
      itemName,
      category,
      description,
      foundLocation,
      foundDate,
      foundTime,
      privateObservations,
      possessionStatus,
    } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = await processUploadedImage(req.file);
    }

    const foundItem = await FoundItem.create({
      studentId: req.user._id,
      itemName: itemName.trim(),
      category,
      description: description.trim(),
      foundLocation: foundLocation.trim(),
      foundDate,
      foundTime: foundTime ? foundTime.trim() : '',
      image: imageUrl,
      privateObservations: privateObservations ? privateObservations.trim() : '',
      possessionStatus: possessionStatus || 'Still with me',
      status: 'AVAILABLE',
    });

    // Notify administrators
    await notifyAllAdmins({
      title: 'New Found Item Reported',
      message: `Student ${req.user.name} reported a found ${foundItem.itemName} (${foundItem.category}) at ${foundItem.foundLocation}.`,
      type: 'REPORT_SUBMITTED',
      relatedEntityType: 'FoundItem',
      relatedEntityId: foundItem._id,
    });

    return sendSuccess(res, 201, 'Found item report submitted successfully.', foundItem);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Browse found items (server-side search, filtering, pagination)
 * @route   GET /api/v1/found-items
 * @access  Public / Authenticated
 */
const getFoundItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    // Search by item name, description, or location
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ itemName: searchRegex }, { description: searchRegex }, { foundLocation: searchRegex }];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    // Location filter
    if (req.query.location) {
      query.foundLocation = new RegExp(req.query.location.trim(), 'i');
    }

    // Status filter - by default exclude RETURNED / CLOSED unless specified
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    } else if (!req.query.status) {
      query.status = { $in: ['AVAILABLE', 'UNDER_REVIEW', 'RESERVED', 'HANDED_OVER_TO_ADMIN'] };
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.foundDate = {};
      if (req.query.startDate) query.foundDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.foundDate.$lte = new Date(req.query.endDate);
    }

    const totalRecords = await FoundItem.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Mask private observations and finder phone/email in public browse
    const items = await FoundItem.find(query)
      .select('-privateObservations')
      .populate('studentId', 'name department academicYear')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, 'Found items retrieved.', {
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
 * @desc    Get found items submitted by current student
 * @route   GET /api/v1/found-items/my
 * @access  Private (Student)
 */
const getMyFoundItems = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const items = await FoundItem.find({ studentId }).sort({ createdAt: -1 });

    // Look for active matches linked to these found items
    const itemIds = items.map((i) => i._id);
    const matches = await Match.find({ foundItemId: { $in: itemIds } }).populate(
      'lostItemId',
      'itemName category lastSeenLocation status'
    );

    const matchMap = {};
    matches.forEach((m) => {
      matchMap[m.foundItemId.toString()] = m;
    });

    const itemsWithMatches = items.map((item) => {
      const obj = item.toObject();
      obj.linkedMatch = matchMap[item._id.toString()] || null;
      return obj;
    });

    return sendSuccess(res, 200, 'My found items retrieved.', itemsWithMatches);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single found item by ID
 * @route   GET /api/v1/found-items/:id
 * @access  Public / Authenticated
 */
const getFoundItemById = async (req, res, next) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id).populate(
      'studentId',
      'name department academicYear email phone'
    );

    if (!foundItem) {
      return sendError(res, 404, 'Found item report not found.');
    }

    const isOwner = req.user && req.user._id.toString() === foundItem.studentId._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    let itemData = foundItem.toObject();

    // Protect private observations and finder phone/email from general public
    if (!isOwner && !isAdmin) {
      delete itemData.privateObservations;
      if (itemData.studentId) {
        delete itemData.studentId.phone;
        delete itemData.studentId.email;
      }
    }

    return sendSuccess(res, 200, 'Found item details retrieved.', itemData);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update eligible found item report
 * @route   PATCH /api/v1/found-items/:id
 * @access  Private (Finder / Admin)
 */
const updateFoundItem = async (req, res, next) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return sendError(res, 404, 'Found item report not found.');
    }

    if (foundItem.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'You are not authorized to edit this report.');
    }

    const {
      itemName,
      category,
      description,
      foundLocation,
      foundDate,
      foundTime,
      privateObservations,
      possessionStatus,
    } = req.body;

    if (itemName) foundItem.itemName = itemName.trim();
    if (category) foundItem.category = category;
    if (description) foundItem.description = description.trim();
    if (foundLocation) foundItem.foundLocation = foundLocation.trim();
    if (foundDate) foundItem.foundDate = foundDate;
    if (foundTime !== undefined) foundItem.foundTime = foundTime.trim();
    if (privateObservations !== undefined) foundItem.privateObservations = privateObservations.trim();
    if (possessionStatus) foundItem.possessionStatus = possessionStatus;

    if (req.file) {
      foundItem.image = await processUploadedImage(req.file);
    }

    await foundItem.save();

    return sendSuccess(res, 200, 'Found item updated successfully.', foundItem);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createFoundItem,
  getFoundItems,
  getMyFoundItems,
  getFoundItemById,
  updateFoundItem,
};

