const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getStudents,
  updateStudentStatus,
  importCollegeRoster,
  getAllLostItemsAdmin,
  updateLostItemAdmin,
  getAllFoundItemsAdmin,
  updateFoundItemAdmin,
  getAllResponsesAdmin,
  updateResponseAdmin,
  getAuditLogs,
  getAnalytics,
} = require('../controllers/adminController');

const {
  getAllMatches,
  createMatch,
  getSuggestedMatchesForLostItem,
  updateMatch,
} = require('../controllers/matchController');

const {
  verifyOwnership,
  scheduleHandover,
  getHandovers,
  updateHandover,
} = require('../controllers/handoverController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard & Analytics
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);

// Student management & College Roster
router.get('/students', getStudents);
router.patch('/students/:id/status', updateStudentStatus);
router.post('/roster/import', importCollegeRoster);

// Lost & Found administrative views
router.get('/lost-items', getAllLostItemsAdmin);
router.patch('/lost-items/:id', updateLostItemAdmin);
router.get('/found-items', getAllFoundItemsAdmin);
router.patch('/found-items/:id', updateFoundItemAdmin);

// Responses review
router.get('/responses', getAllResponsesAdmin);
router.patch('/responses/:id', updateResponseAdmin);

// Matching workspace
router.get('/matches', getAllMatches);
router.post('/matches', createMatch);
router.get('/matches/suggestions/:lostItemId', getSuggestedMatchesForLostItem);
router.patch('/matches/:id', updateMatch);

// Ownership verification
router.patch('/verification/:matchId', verifyOwnership);

// Handover management
router.post('/handovers', scheduleHandover);
router.get('/handovers', getHandovers);
router.patch('/handovers/:id', updateHandover);

module.exports = router;

