const { body } = require('express-validator');
const { validate } = require('./authValidator');
const { validCategories } = require('./lostItemValidator');

const createFoundItemValidator = [
  body('itemName').trim().notEmpty().withMessage('Item name is required'),
  body('category')
    .trim()
    .isIn(validCategories)
    .withMessage(`Category must be one of: ${validCategories.join(', ')}`),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('foundLocation').trim().notEmpty().withMessage('Found location is required'),
  body('foundDate')
    .notEmpty()
    .withMessage('Found date is required')
    .isISO8601()
    .withMessage('Please enter a valid found date'),
  body('possessionStatus')
    .optional()
    .isIn(['Still with me', 'Deposited at admin office'])
    .withMessage("Possession status must be 'Still with me' or 'Deposited at admin office'"),
  validate,
];

module.exports = { createFoundItemValidator };

