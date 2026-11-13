const Match = require('../models/Match');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const AuditLog = require('../models/AuditLog');
const { calculateMatchScore } = require('../services/matchingService');
const { createNotification } = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get AI/rule-based suggested matches for a specific lost item
 * @route   GET /api/v1/admin/matches/suggestions/:lostItemId
 * @access  Private (Admin)
 */
const getSuggestedMatchesForLostItem = async (req, res, next) => {
  try {
    const { lostItemId } = req.params;
    const lostItem = await LostItem.findById(lostItemId);
    if (!lostItem) {
      return sendError(res, 404, 'Lost item not found.');
    }

    // Find all active found items that are not returned or closed
    const foundItems = await FoundItem.find({
      status: { $in: ['AVAILABLE', 'UNDER_REVIEW', 'RESERVED', 'HANDED_OVER_TO_ADMIN'] },
    }).populate('studentId', 'name collegeId department phone email');

    // Run matching engine
    const suggestions = foundItems.map((foundItem) => {
      const matchResult = calculateMatchScore(lostItem, foundItem);
      return {
        foundItem,
        matchScore: matchResult.score,
        matchingFactors: matchResult.factors,
      };
    });

    // Sort descending by score
    suggestions.sort((a, b) => b.matchScore - a.matchScore);

    return sendSuccess(res, 200, 'Match suggestions computed.', {
      lostItem,
      suggestions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a potential match between a lost report and a found report
 * @route   POST /api/v1/admin/matches
 * @access  Private (Admin)
 */
const createMatch = async (req, res, next) => {
  try {
    const { lostItemId, foundItemId, responseId, remarks } = req.body;

    if (!lostItemId || !foundItemId) {
      return sendError(res, 400, 'Both lostItemId and foundItemId are required.');
    }

    const lostItem = await LostItem.findById(lostItemId);
    const foundItem = await FoundItem.findById(foundItemId);

    if (!lostItem || !foundItem) {
      return sendError(res, 404, 'Lost item or Found item not found.');
    }

    // Check if found item is already assigned to a completed or verified match
    const existingApprovedMatch = await Match.findOne({
      foundItemId,
      matchStatus: { $in: ['APPROVED', 'COMPLETED'] },
    });

    if (existingApprovedMatch) {
      return sendError(
        res,
        400,
        'This found item has already been matched and verified for another claim.'
      );
    }

    // Calculate score
    const { score, factors } = calculateMatchScore(lostItem, foundItem);

    const match = await Match.create({
      lostItemId,
      foundItemId,
      responseId: responseId || null,
      adminId: req.user._id,
      matchScore: score,
      matchingFactors: factors,
      matchStatus: 'UNDER_VERIFICATION',
      remarks: remarks ? remarks.trim() : '',
    });

    // Update statuses
    lostItem.status = 'MATCHED';
    await lostItem.save();

    foundItem.status = 'RESERVED';
    await foundItem.save();

    // Create Audit Log
    await AuditLog.create({
      adminId: req.user._id,
      action: 'MATCH_CREATED',
      entityType: 'Match',
      entityId: match._id,
      description: `Admin created potential match between Lost Item "${lostItem.itemName}" and Found Item "${foundItem.itemName}" with score ${score}%.`,
    });

    // Notify the owner
    await createNotification({
      recipientId: lostItem.studentId,
      title: 'Potential Match Found',
      message: `An administrator identified a potential match for your lost item "${lostItem.itemName}". Ownership verification is now underway.`,
      type: 'VERIFICATION_REQUESTED',
      relatedEntityType: 'Match',
      relatedEntityId: match._id,
    });

    return sendSuccess(res, 201, 'Match created and moved to ownership verification.', match);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all matches with filtering
 * @route   GET /api/v1/admin/matches
 * @access  Private (Admin)
 */
const getAllMatches = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.matchStatus = req.query.status;
    }

    const [matches, totalRecords] = await Promise.all([
      Match.find(query)
        .populate({
          path: 'lostItemId',
          populate: { path: 'studentId', select: 'name collegeId department phone email' },
        })
        .populate({
          path: 'foundItemId',
          populate: { path: 'studentId', select: 'name collegeId department phone email' },
        })
        .populate('adminId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Match.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Matches retrieved.', {
      matches,
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
 * @desc    Update match status / remarks
 * @route   PATCH /api/v1/admin/matches/:id
 * @access  Private (Admin)
 */
const updateMatch = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const match = await Match.findById(req.params.id)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!match) {
      return sendError(res, 404, 'Match record not found.');
    }

    if (status) match.matchStatus = status;
    if (remarks !== undefined) match.remarks = remarks.trim();

    await match.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: 'MATCH_UPDATED',
      entityType: 'Match',
      entityId: match._id,
      description: `Admin updated match status to ${status || match.matchStatus}.`,
    });

    return sendSuccess(res, 200, 'Match updated successfully.', match);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSuggestedMatchesForLostItem,
  createMatch,
  getAllMatches,
  updateMatch,
};

