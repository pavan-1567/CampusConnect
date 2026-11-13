const User = require('../models/User');
const CollegeRoster = require('../models/CollegeRoster');
const { sendTokenResponse, clearTokenCookie } = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { notifyAllAdmins } = require('../services/notificationService');

/**
 * @desc    Register a new student
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      collegeId,
      name,
      email,
      phone,
      department,
      academicYear,
      password,
    } = req.body;

    const normalizedCollegeId = collegeId.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if collegeId or email already exists
    const existingUser = await User.findOne({
      $or: [{ collegeId: normalizedCollegeId }, { email: normalizedEmail }],
    });

    if (existingUser) {
      if (existingUser.collegeId === normalizedCollegeId) {
        return sendError(res, 400, 'A user with this College ID is already registered.');
      }
      return sendError(res, 400, 'A user with this email address is already registered.');
    }

    // Check authorized college roster
    const rosterRecord = await CollegeRoster.findOne({
      collegeId: normalizedCollegeId,
    });

    let isCollegeVerified = false;
    let accountStatus = 'PENDING_APPROVAL';

    if (rosterRecord && rosterRecord.verificationStatus === 'VERIFIED') {
      isCollegeVerified = true;
      accountStatus = 'ACTIVE';
    }

    // Strictly enforce student role - users cannot register as admin
    const user = await User.create({
      collegeId: normalizedCollegeId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      department: department.trim(),
      academicYear: academicYear.trim(),
      password,
      role: 'student',
      accountStatus,
      isCollegeVerified,
    });

    if (accountStatus === 'PENDING_APPROVAL') {
      await notifyAllAdmins({
        title: 'New Student Registration Pending',
        message: `Student ${user.name} (${user.collegeId}) registered and requires roster verification or admin approval.`,
        type: 'ADMIN_REVIEWED',
        relatedEntityType: 'System',
        relatedEntityId: user._id,
      });

      return res.status(201).json({
        success: true,
        message:
          'Registration submitted successfully! Your account is pending admin or college roster verification before you can log in.',
        data: {
          user: user.toSafeObject(),
          requiresApproval: true,
        },
      });
    }

    // If verified automatically against college roster, generate session token
    return sendTokenResponse(user, 201, res, 'Registration successful and verified with college roster.');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Log in user (Student or Admin)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { collegeId, password } = req.body;

    if (!collegeId || !password) {
      return sendError(res, 400, 'Please provide College ID and password.');
    }

    const normalizedCollegeId = collegeId.trim().toUpperCase();

    // Find user by college ID and include password
    const user = await User.findOne({ collegeId: normalizedCollegeId }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid College ID or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid College ID or password.');
    }

    if (user.accountStatus === 'DEACTIVATED') {
      return sendError(res, 403, 'Your account has been deactivated. Please contact college administration.');
    }

    if (user.accountStatus === 'PENDING_APPROVAL' && user.role !== 'admin') {
      return sendError(
        res,
        403,
        'Your registration is currently pending college roster verification or administrator approval.'
      );
    }

    return sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Log out user & clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }
    return sendSuccess(res, 200, 'Profile retrieved.', { user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Change password
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 400, 'Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, 'Password updated successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword,
};

