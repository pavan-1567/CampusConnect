const { body } = require('express-validator');
const { validate } = require('./authValidator');

const validCategories = [
  'ID Cards',
  'Electronics',
  'Personal Accessories',
  'Books and Stationery',
  'Bags',
  'Clothing',
  'Documents',
  'Keys',
  'Other',
];

const createLostItemValidator = [
  body('itemName').trim().notEmpty().withMessage('Item name is required'),
  body('category')
    .trim()
    .isIn(validCategories)
    .withMessage(`Category must be one of: ${validCategories.join(', ')}`),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('lastSeenLocation').trim().notEmpty().withMessage('Last seen location is required'),
  body('lostDate')
    .notEmpty()
    .withMessage('Lost date is required')
    .isISO8601()
    .withMessage('Please enter a valid lost date'),
  validate,
];

module.exports = { createLostItemValidator, validCategories };

