const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'ID Cards',
        'Electronics',
        'Personal Accessories',
        'Books and Stationery',
        'Bags',
        'Clothing',
        'Documents',
        'Keys',
        'Other',
      ],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    lastSeenLocation: {
      type: String,
      required: [true, 'Last seen location is required'],
      trim: true,
      index: true,
    },
    lostDate: {
      type: Date,
      required: [true, 'Lost date is required'],
      index: true,
    },
    lostTime: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    // Private identifying details - visible ONLY to student owner and authorized admins
    identifyingDetails: {
      type: String,
      trim: true,
      default: '',
    },
    // Private contact number - visible ONLY to student owner and authorized admins
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'OPEN',
        'UNDER_REVIEW',
        'MATCHED',
        'VERIFICATION_PENDING',
        'APPROVED',
        'REJECTED',
        'RETURNED',
        'CLOSED',
      ],
      default: 'OPEN',
      index: true,
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    closedReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to mask private details for public listings
lostItemSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.identifyingDetails;
  delete obj.contactNumber;
  return obj;
};

module.exports = mongoose.model('LostItem', lostItemSchema);

