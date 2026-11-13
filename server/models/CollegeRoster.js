const mongoose = require('mongoose');

const collegeRosterSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: [true, 'College ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'College email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'PROVISIONAL', 'REVOKED'],
      default: 'VERIFIED',
    },
    isDemonstration: {
      type: Boolean,
      default: false,
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CollegeRoster', collegeRosterSchema);

