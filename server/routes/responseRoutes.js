const express = require('express');
const router = express.Router();
const {
  createResponse,
  getMyResponses,
  getResponsesForLostItem,
  getResponseById,
} = require('../controllers/responseController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/', upload.single('evidenceImage'), createResponse);
router.get('/my', getMyResponses);
router.get('/lost/:lostItemId', getResponsesForLostItem);
router.get('/:id', getResponseById);

module.exports = router;

