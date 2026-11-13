const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => err.msg),
    });
  }
  next();
};

const registerValidator = [
  body('collegeId')
    .trim()
    .notEmpty()
    .withMessage('College ID is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('College ID must be between 3 and 30 characters'),
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('A valid college email address is required').normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+-\s()]{7,20}$/)
    .withMessage('Please enter a valid contact phone number'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  validate,
];

const loginValidator = [
  body('collegeId').trim().notEmpty().withMessage('College ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('New password confirmation does not match');
    }
    return true;
  }),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  changePasswordValidator,
};

