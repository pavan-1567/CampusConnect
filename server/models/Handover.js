const mongoose = require('mongoose');

const handoverSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: true,
      index: true,
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    finderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collectionLocation: {
      type: String,
      default: 'College Admin Block',
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled collection date and time is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    verificationMethod: {
      type: String,
      default: 'College ID and Physical Identifying Verification',
      trim: true,
    },
    finderDepositedAt: {
      type: Date,
      default: null,
    },
    handedOverAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Handover', handoverSchema);

