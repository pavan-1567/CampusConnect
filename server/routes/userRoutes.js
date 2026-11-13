const express = require('express');
const router = express.Router();
const { updateProfile, getStudentDashboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.patch('/profile', updateProfile);
router.get('/dashboard', getStudentDashboard);

module.exports = router;

