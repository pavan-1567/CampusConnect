import api from './api';

const getNotifications = async (params = {}) => {
  return await api.get('/notifications', { params });
};

const markAsRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

const markAllAsRead = async () => {
  return await api.patch('/notifications/read-all');
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationService;

