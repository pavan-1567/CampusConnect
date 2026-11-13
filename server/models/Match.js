const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
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
    responseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Response',
      default: null,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    matchingFactors: {
      nameScore: { type: Number, default: 0 },
      categoryScore: { type: Number, default: 0 },
      locationScore: { type: Number, default: 0 },
      dateScore: { type: Number, default: 0 },
      descriptionScore: { type: Number, default: 0 },
    },
    matchStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_VERIFICATION', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Match', matchSchema);

