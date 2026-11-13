const Handover = require('../models/Handover');
const Match = require('../models/Match');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const AuditLog = require('../models/AuditLog');
const { createNotification } = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Verify or reject ownership claim
 * @route   PATCH /api/v1/admin/verification/:matchId
 * @access  Private (Admin)
 */
const verifyOwnership = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { action, remarks } = req.body; // action: 'APPROVE' | 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return sendError(res, 400, "Action must be either 'APPROVE' or 'REJECT'.");
    }

    if (action === 'REJECT' && (!remarks || !remarks.trim())) {
      return sendError(res, 400, 'A clear reason or remarks is required when rejecting ownership.');
    }

    const match = await Match.findById(matchId)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!match) {
      return sendError(res, 404, 'Match record not found.');
    }

    const lostItem = match.lostItemId;
    const foundItem = match.foundItemId;

    if (action === 'APPROVE') {
      match.matchStatus = 'APPROVED';
      match.remarks = remarks ? remarks.trim() : match.remarks;
      await match.save();

      lostItem.status = 'APPROVED';
      await lostItem.save();

      foundItem.status = 'RESERVED';
      await foundItem.save();

      await AuditLog.create({
        adminId: req.user._id,
        action: 'OWNERSHIP_VERIFIED',
        entityType: 'Match',
        entityId: match._id,
        description: `Admin approved ownership claim for "${lostItem.itemName}" against found item "${foundItem.itemName}". Remarks: ${remarks || 'Verified successfully'}.`,
      });

      // Notify owner
      await createNotification({
        recipientId: lostItem.studentId,
        title: 'Ownership Claim Approved!',
        message: `Your ownership claim for "${lostItem.itemName}" has been officially verified by the college administrator. Collection will be scheduled at College Admin Block.`,
        type: 'CLAIM_APPROVED',
        relatedEntityType: 'Match',
        relatedEntityId: match._id,
      });

      // Notify finder
      await createNotification({
        recipientId: foundItem.studentId,
        title: 'Ownership Verified For Found Item',
        message: `The owner for "${foundItem.itemName}" has been verified by the administrator. Please follow instructions to deposit or coordinate handover at the Admin Block.`,
        type: 'CLAIM_APPROVED',
        relatedEntityType: 'FoundItem',
        relatedEntityId: foundItem._id,
      });

      return sendSuccess(res, 200, 'Ownership verified successfully. Handover scheduling is now enabled.', match);
    } else {
      // REJECT
      match.matchStatus = 'REJECTED';
      match.remarks = remarks.trim();
      await match.save();

      lostItem.status = 'REJECTED';
      lostItem.adminRemarks = remarks.trim();
      await lostItem.save();

      // Return found item back to AVAILABLE so other students or matches can claim it
      foundItem.status = 'AVAILABLE';
      await foundItem.save();

      await AuditLog.create({
        adminId: req.user._id,
        action: 'OWNERSHIP_REJECTED',
        entityType: 'Match',
        entityId: match._id,
        description: `Admin rejected ownership claim for "${lostItem.itemName}". Reason: ${remarks.trim()}.`,
      });

      // Notify claimant
      await createNotification({
        recipientId: lostItem.studentId,
        title: 'Ownership Claim Rejected',
        message: `Your ownership claim for "${lostItem.itemName}" was not approved. Reason: ${remarks.trim()}.`,
        type: 'CLAIM_REJECTED',
        relatedEntityType: 'Match',
        relatedEntityId: match._id,
      });

      return sendSuccess(res, 200, 'Ownership claim rejected.', match);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Schedule item collection handover
 * @route   POST /api/v1/admin/handovers
 * @access  Private (Admin)
 */
const scheduleHandover = async (req, res, next) => {
  try {
    const { matchId, scheduledAt, collectionLocation, verificationMethod, remarks } = req.body;

    if (!matchId || !scheduledAt) {
      return sendError(res, 400, 'matchId and scheduledAt date/time are required.');
    }

    const match = await Match.findById(matchId)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!match) {
      return sendError(res, 404, 'Match record not found.');
    }

    if (match.matchStatus !== 'APPROVED') {
      return sendError(res, 400, 'Cannot schedule handover for an unapproved or pending match.');
    }

    // Check if handover already exists for this match
    const existingHandover = await Handover.findOne({
      lostItemId: match.lostItemId._id,
      foundItemId: match.foundItemId._id,
      status: { $in: ['PENDING', 'SCHEDULED'] },
    });

    if (existingHandover) {
      return sendError(res, 400, 'A handover is already scheduled for this match.');
    }

    const handover = await Handover.create({
      lostItemId: match.lostItemId._id,
      foundItemId: match.foundItemId._id,
      ownerId: match.lostItemId.studentId,
      finderId: match.foundItemId.studentId,
      adminId: req.user._id,
      collectionLocation: collectionLocation || 'College Admin Block',
      scheduledAt: new Date(scheduledAt),
      status: 'SCHEDULED',
      verificationMethod: verificationMethod || 'College ID and Physical Identifying Verification',
      remarks: remarks ? remarks.trim() : '',
    });

    await AuditLog.create({
      adminId: req.user._id,
      action: 'HANDOVER_SCHEDULED',
      entityType: 'Handover',
      entityId: handover._id,
      description: `Admin scheduled collection for "${match.lostItemId.itemName}" on ${new Date(scheduledAt).toLocaleString()} at ${handover.collectionLocation}.`,
    });

    // Notify owner
    await createNotification({
      recipientId: match.lostItemId.studentId,
      title: 'Item Collection Scheduled',
      message: `Your item "${match.lostItemId.itemName}" is scheduled for collection on ${new Date(scheduledAt).toLocaleString()} at ${handover.collectionLocation}. Please bring your College ID card.`,
      type: 'COLLECTION_SCHEDULED',
      relatedEntityType: 'Handover',
      relatedEntityId: handover._id,
    });

    // Notify finder
    await createNotification({
      recipientId: match.foundItemId.studentId,
      title: 'Item Handover Scheduled',
      message: `The return process for "${match.foundItemId.itemName}" is scheduled on ${new Date(scheduledAt).toLocaleString()} at ${handover.collectionLocation}. Thank you for your honesty!`,
      type: 'COLLECTION_SCHEDULED',
      relatedEntityType: 'Handover',
      relatedEntityId: handover._id,
    });

    return sendSuccess(res, 201, 'Collection handover scheduled successfully.', handover);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all handovers
 * @route   GET /api/v1/admin/handovers
 * @access  Private (Admin)
 */
const getHandovers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const [handovers, totalRecords] = await Promise.all([
      Handover.find(query)
        .populate('lostItemId', 'itemName category image status')
        .populate('foundItemId', 'itemName category image status possessionStatus')
        .populate('ownerId', 'name collegeId department phone email')
        .populate('finderId', 'name collegeId department phone email')
        .populate('adminId', 'name')
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit),
      Handover.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Handovers retrieved.', {
      handovers,
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
 * @desc    Update handover (record deposit, complete handover, or cancel)
 * @route   PATCH /api/v1/admin/handovers/:id
 * @access  Private (Admin)
 */
const updateHandover = async (req, res, next) => {
  try {
    const { status, finderDepositedAt, remarks, cancellationReason } = req.body;

    const handover = await Handover.findById(req.params.id)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!handover) {
      return sendError(res, 404, 'Handover record not found.');
    }

    if (finderDepositedAt) {
      handover.finderDepositedAt = new Date(finderDepositedAt);
      if (handover.foundItemId) {
        handover.foundItemId.possessionStatus = 'Deposited at admin office';
        handover.foundItemId.status = 'HANDED_OVER_TO_ADMIN';
        await handover.foundItemId.save();
      }
    }

    if (remarks !== undefined) {
      handover.remarks = remarks.trim();
    }

    if (status === 'COMPLETED') {
      handover.status = 'COMPLETED';
      handover.handedOverAt = new Date();

      // Update lost item to RETURNED
      if (handover.lostItemId) {
        handover.lostItemId.status = 'RETURNED';
        await handover.lostItemId.save();
      }

      // Update found item to RETURNED
      if (handover.foundItemId) {
        handover.foundItemId.status = 'RETURNED';
        await handover.foundItemId.save();
      }

      // Update match to COMPLETED
      await Match.updateMany(
        {
          lostItemId: handover.lostItemId._id,
          foundItemId: handover.foundItemId._id,
        },
        { matchStatus: 'COMPLETED' }
      );

      await AuditLog.create({
        adminId: req.user._id,
        action: 'HANDOVER_COMPLETED',
        entityType: 'Handover',
        entityId: handover._id,
        description: `Admin completed handover of "${handover.lostItemId.itemName}" to owner. Both records marked RETURNED.`,
      });

      // Notify owner
      await createNotification({
        recipientId: handover.ownerId,
        title: 'Handover Completed – Item Reconnected!',
        message: `Your belonging "${handover.lostItemId.itemName}" has been successfully returned to you. Thank you for using CampusConnect!`,
        type: 'HANDOVER_COMPLETED',
        relatedEntityType: 'Handover',
        relatedEntityId: handover._id,
      });

      // Notify finder
      await createNotification({
        recipientId: handover.finderId,
        title: 'Return Completed – Thank You!',
        message: `The item "${handover.foundItemId.itemName}" you found has been safely returned to its verified owner. The campus appreciates your integrity!`,
        type: 'HANDOVER_COMPLETED',
        relatedEntityType: 'Handover',
        relatedEntityId: handover._id,
      });
    } else if (status === 'CANCELLED') {
      handover.status = 'CANCELLED';
      handover.cancellationReason = cancellationReason || 'Cancelled by admin.';

      await AuditLog.create({
        adminId: req.user._id,
        action: 'HANDOVER_CANCELLED',
        entityType: 'Handover',
        entityId: handover._id,
        description: `Admin cancelled scheduled handover for "${handover.lostItemId.itemName}". Reason: ${handover.cancellationReason}.`,
      });
    }

    await handover.save();

    return sendSuccess(res, 200, 'Handover updated successfully.', handover);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  verifyOwnership,
  scheduleHandover,
  getHandovers,
  updateHandover,
};

