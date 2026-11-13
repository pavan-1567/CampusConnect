const express = require('express');
const router = express.Router();
const {
  createLostItem,
  getLostItems,
  getMyLostItems,
  getLostItemById,
  updateLostItem,
  cancelLostItem,
} = require('../controllers/lostItemController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { createLostItemValidator } = require('../validators/lostItemValidator');

router.post('/', protect, upload.single('image'), createLostItemValidator, createLostItem);
router.get('/', getLostItems);
router.get('/my', protect, getMyLostItems);
router.get('/:id', optionalAuth, getLostItemById);
router.patch('/:id', protect, upload.single('image'), updateLostItem);
router.patch('/:id/cancel', protect, cancelLostItem);

module.exports = router;

