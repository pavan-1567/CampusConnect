const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Response message is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description of found item is required'],
      trim: true,
    },
    foundLocation: {
      type: String,
      required: [true, 'Location where item was found is required'],
      trim: true,
    },
    foundDate: {
      type: Date,
      required: [true, 'Date item was found is required'],
    },
    evidenceImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending responses by same responder for the same lost item
responseSchema.index({ lostItemId: 1, responderId: 1, status: 1 });

module.exports = mongoose.model('Response', responseSchema);

