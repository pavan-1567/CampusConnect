const Response = require('../models/Response');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const { processUploadedImage } = require('../middleware/uploadMiddleware');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { createNotification, notifyAllAdmins } = require('../services/notificationService');

/**
 * @desc    Submit a response to a lost item request
 * @route   POST /api/v1/responses
 * @access  Private (Student)
 */
const createResponse = async (req, res, next) => {
  try {
    const { lostItemId, foundItemId, message, description, foundLocation, foundDate } = req.body;

    if (!lostItemId) {
      return sendError(res, 400, 'Lost item ID is required.');
    }

    const lostItem = await LostItem.findById(lostItemId);
    if (!lostItem) {
      return sendError(res, 404, 'Lost item not found.');
    }

    if (['RETURNED', 'CLOSED'].includes(lostItem.status)) {
      return sendError(res, 400, `Cannot respond to a lost item that is already ${lostItem.status}.`);
    }

    // A student cannot respond to their own lost item
    if (lostItem.studentId.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot submit a response to your own lost item request.');
    }

    // Prevent duplicate active responses by the same student
    const existingActiveResponse = await Response.findOne({
      lostItemId,
      responderId: req.user._id,
      status: { $in: ['PENDING', 'UNDER_REVIEW', 'ACCEPTED'] },
    });

    if (existingActiveResponse) {
      return sendError(
        res,
        400,
        'You have already submitted an active response for this lost item. Please wait for administrator review.'
      );
    }

    // Optional evidence image
    let evidenceImageUrl = '';
    if (req.file) {
      evidenceImageUrl = await processUploadedImage(req.file);
    }

    // If linking an existing found item, verify ownership
    let validFoundItemId = null;
    if (foundItemId) {
      const foundItem = await FoundItem.findById(foundItemId);
      if (foundItem && foundItem.studentId.toString() === req.user._id.toString()) {
        validFoundItemId = foundItem._id;
      }
    }

    const response = await Response.create({
      lostItemId,
      foundItemId: validFoundItemId,
      responderId: req.user._id,
      message: message.trim(),
      description: description.trim(),
      foundLocation: foundLocation.trim(),
      foundDate: foundDate || Date.now(),
      evidenceImage: evidenceImageUrl,
      status: 'PENDING',
    });

    // Update lost item status to UNDER_REVIEW if it was OPEN
    if (lostItem.status === 'OPEN') {
      lostItem.status = 'UNDER_REVIEW';
      await lostItem.save();
    }

    // Notify original owner (without revealing responder's private phone/email)
    await createNotification({
      recipientId: lostItem.studentId,
      title: 'Response Received For Your Lost Item',
      message: `A student has submitted a response indicating they may have found your "${lostItem.itemName}". The college admin is reviewing the match.`,
      type: 'RESPONSE_RECEIVED',
      relatedEntityType: 'LostItem',
      relatedEntityId: lostItem._id,
    });

    // Notify administrators
    await notifyAllAdmins({
      title: 'New Response Submitted',
      message: `A response was submitted for lost item "${lostItem.itemName}" by student ${req.user.name}.`,
      type: 'RESPONSE_RECEIVED',
      relatedEntityType: 'Response',
      relatedEntityId: response._id,
    });

    return sendSuccess(res, 201, 'Your response has been submitted and sent for admin review.', response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get responses submitted by current logged-in student
 * @route   GET /api/v1/responses/my
 * @access  Private (Student)
 */
const getMyResponses = async (req, res, next) => {
  try {
    const responses = await Response.find({ responderId: req.user._id })
      .populate('lostItemId', 'itemName category lastSeenLocation status image')
      .populate('foundItemId', 'itemName category foundLocation status image')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'My responses retrieved.', responses);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get responses for a particular lost item
 * @route   GET /api/v1/responses/lost/:lostItemId
 * @access  Private (Owner or Admin)
 */
const getResponsesForLostItem = async (req, res, next) => {
  try {
    const { lostItemId } = req.params;

    const lostItem = await LostItem.findById(lostItemId);
    if (!lostItem) {
      return sendError(res, 404, 'Lost item not found.');
    }

    const isOwner = lostItem.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'You are not authorized to view responses for this item.');
    }

    const responses = await Response.find({ lostItemId })
      .populate('responderId', isAdmin ? 'name collegeId department academicYear email phone' : 'name department academicYear')
      .populate('foundItemId', 'itemName category foundLocation image')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Responses for lost item retrieved.', responses);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single response by ID
 * @route   GET /api/v1/responses/:id
 * @access  Private (Responder, Lost-Item Owner, or Admin)
 */
const getResponseById = async (req, res, next) => {
  try {
    const response = await Response.findById(req.params.id)
      .populate('lostItemId')
      .populate('foundItemId')
      .populate('responderId', 'name collegeId department academicYear email phone');

    if (!response) {
      return sendError(res, 404, 'Response not found.');
    }

    const isResponder = response.responderId._id.toString() === req.user._id.toString();
    const isOwner = response.lostItemId && response.lostItemId.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isResponder && !isOwner && !isAdmin) {
      return sendError(res, 403, 'You are not authorized to view this response.');
    }

    return sendSuccess(res, 200, 'Response details retrieved.', response);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createResponse,
  getMyResponses,
  getResponsesForLostItem,
  getResponseById,
};

