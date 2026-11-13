import api from './api';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.token) {
    localStorage.setItem('cc_token', response.token);
  }
  return response;
};

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.token) {
    localStorage.setItem('cc_token', response.token);
  }
  return response;
};

const logout = async () => {
  const response = await api.post('/auth/logout');
  localStorage.removeItem('cc_token');
  return response;
};

const getMe = async () => {
  return await api.get('/auth/me');
};

const changePassword = async (passwords) => {
  return await api.patch('/auth/change-password', passwords);
};

const updateProfile = async (profileData) => {
  return await api.patch('/users/profile', profileData);
};

const getStudentDashboard = async () => {
  return await api.get('/users/dashboard');
};

const authService = {
  register,
  login,
  logout,
  getMe,
  changePassword,
  updateProfile,
  getStudentDashboard,
};

export default authService;

