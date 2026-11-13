const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'none') {
    return sendError(res, 401, 'Authentication required. Please log in.');
  }

  try {
    const secret = process.env.JWT_SECRET || 'campusconnect_jwt_super_secret_dev_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'The account belonging to this token no longer exists.');
    }

    if (user.accountStatus === 'DEACTIVATED') {
      return sendError(res, 403, 'Your account has been deactivated. Please contact campus admin.');
    }

    if (user.accountStatus === 'PENDING_APPROVAL' && user.role !== 'admin') {
      return sendError(
        res,
        403,
        'Your registration is currently pending admin or college verification.'
      );
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Your session has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

const optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token && token !== 'none') {
    try {
      const secret = process.env.JWT_SECRET || 'campusconnect_jwt_super_secret_dev_key_2026';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id);
      if (user && user.accountStatus === 'ACTIVE') {
        req.user = user;
      }
    } catch (err) {
      // Ignore token decode error for optional auth
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
