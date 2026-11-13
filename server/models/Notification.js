const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'REPORT_SUBMITTED',
        'RESPONSE_RECEIVED',
        'ADMIN_REVIEWED',
        'VERIFICATION_REQUESTED',
        'CLAIM_APPROVED',
        'CLAIM_REJECTED',
        'COLLECTION_SCHEDULED',
        'HANDOVER_COMPLETED',
        'REPORT_CLOSED',
      ],
      required: true,
      index: true,
    },
    relatedEntityType: {
      type: String,
      enum: ['LostItem', 'FoundItem', 'Response', 'Match', 'Handover', 'System'],
      default: 'System',
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);

