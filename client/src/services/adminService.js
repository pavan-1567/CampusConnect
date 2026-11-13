import api from './api';

const getAdminDashboard = async () => {
  return await api.get('/admin/dashboard');
};

const getStudents = async (params = {}) => {
  return await api.get('/admin/students', { params });
};

const updateStudentStatus = async (id, status) => {
  return await api.patch(`/admin/students/${id}/status`, { status });
};

const importRoster = async (records) => {
  return await api.post('/admin/roster/import', { records });
};

const getLostItemsAdmin = async (params = {}) => {
  return await api.get('/admin/lost-items', { params });
};

const updateLostItemAdmin = async (id, data) => {
  return await api.patch(`/admin/lost-items/${id}`, data);
};

const getFoundItemsAdmin = async (params = {}) => {
  return await api.get('/admin/found-items', { params });
};

const updateFoundItemAdmin = async (id, data) => {
  return await api.patch(`/admin/found-items/${id}`, data);
};

const getResponsesAdmin = async (params = {}) => {
  return await api.get('/admin/responses', { params });
};

const updateResponseAdmin = async (id, data) => {
  return await api.patch(`/admin/responses/${id}`, data);
};

const getMatches = async (params = {}) => {
  return await api.get('/admin/matches', { params });
};

const getSuggestedMatches = async (lostItemId) => {
  return await api.get(`/admin/matches/suggestions/${lostItemId}`);
};

const createMatch = async (matchData) => {
  return await api.post('/admin/matches', matchData);
};

const updateMatch = async (id, data) => {
  return await api.patch(`/admin/matches/${id}`, data);
};

const verifyOwnership = async (matchId, data) => {
  return await api.patch(`/admin/verification/${matchId}`, data);
};

const scheduleHandover = async (handoverData) => {
  return await api.post('/admin/handovers', handoverData);
};

const getHandovers = async (params = {}) => {
  return await api.get('/admin/handovers', { params });
};

const updateHandover = async (id, data) => {
  return await api.patch(`/admin/handovers/${id}`, data);
};

const getAuditLogs = async (params = {}) => {
  return await api.get('/admin/audit-logs', { params });
};

const getAnalytics = async () => {
  return await api.get('/admin/analytics');
};

const adminService = {
  getAdminDashboard,
  getStudents,
  updateStudentStatus,
  importRoster,
  getLostItemsAdmin,
  updateLostItemAdmin,
  getFoundItemsAdmin,
  updateFoundItemAdmin,
  getResponsesAdmin,
  updateResponseAdmin,
  getMatches,
  getSuggestedMatches,
  createMatch,
  updateMatch,
  verifyOwnership,
  scheduleHandover,
  getHandovers,
  updateHandover,
  getAuditLogs,
  getAnalytics,
};

export default adminService;

