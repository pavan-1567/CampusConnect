const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const secret = process.env.JWT_SECRET || 'campusconnect_jwt_super_secret_dev_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign(
    {
      id: user._id,
      collegeId: user.collegeId,
      role: user.role,
    },
    secret,
    { expiresIn }
  );

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token, // Also returned in body for flexible client header authorization if cookies are restricted
      data: {
        user: typeof user.toSafeObject === 'function' ? user.toSafeObject() : user,
      },
    });
};

const clearTokenCookie = (res) => {
  res.cookie('token', 'none', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};

module.exports = { sendTokenResponse, clearTokenCookie };

