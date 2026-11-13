const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
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
    foundLocation: {
      type: String,
      required: [true, 'Found location is required'],
      trim: true,
      index: true,
    },
    foundDate: {
      type: Date,
      required: [true, 'Found date is required'],
      index: true,
    },
    foundTime: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    // Private identifying observations - hidden from general public & claimants
    privateObservations: {
      type: String,
      trim: true,
      default: '',
    },
    possessionStatus: {
      type: String,
      enum: ['Still with me', 'Deposited at admin office'],
      default: 'Still with me',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'UNDER_REVIEW',
        'RESERVED',
        'HANDED_OVER_TO_ADMIN',
        'RETURNED',
        'CLOSED',
      ],
      default: 'AVAILABLE',
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

foundItemSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.privateObservations;
  // If finder user is populated, do not expose finder's phone or email to public
  if (obj.studentId && typeof obj.studentId === 'object') {
    delete obj.studentId.phone;
    delete obj.studentId.email;
  }
  return obj;
};

module.exports = mongoose.model('FoundItem', foundItemSchema);

