import api from './api';

const createLostItem = async (formData) => {
  return await api.post('/lost-items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getLostItems = async (params = {}) => {
  return await api.get('/lost-items', { params });
};

const getMyLostItems = async () => {
  return await api.get('/lost-items/my');
};

const getLostItemById = async (id) => {
  return await api.get(`/lost-items/${id}`);
};

const updateLostItem = async (id, formData) => {
  return await api.patch(`/lost-items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const cancelLostItem = async (id, reason) => {
  return await api.patch(`/lost-items/${id}/cancel`, { reason });
};

const lostItemService = {
  createLostItem,
  getLostItems,
  getMyLostItems,
  getLostItemById,
  updateLostItem,
  cancelLostItem,
};

export default lostItemService;

