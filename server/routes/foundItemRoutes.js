const express = require('express');
const router = express.Router();
const {
  createFoundItem,
  getFoundItems,
  getMyFoundItems,
  getFoundItemById,
  updateFoundItem,
} = require('../controllers/foundItemController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { createFoundItemValidator } = require('../validators/foundItemValidator');

router.post('/', protect, upload.single('image'), createFoundItemValidator, createFoundItem);
router.get('/', getFoundItems);
router.get('/my', protect, getMyFoundItems);
router.get('/:id', optionalAuth, getFoundItemById);
router.patch('/:id', protect, upload.single('image'), updateFoundItem);

module.exports = router;

