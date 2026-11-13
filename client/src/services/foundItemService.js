import api from './api';

const createFoundItem = async (formData) => {
  return await api.post('/found-items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getFoundItems = async (params = {}) => {
  return await api.get('/found-items', { params });
};

const getMyFoundItems = async () => {
  return await api.get('/found-items/my');
};

const getFoundItemById = async (id) => {
  return await api.get(`/found-items/${id}`);
};

const updateFoundItem = async (id, formData) => {
  return await api.patch(`/found-items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const foundItemService = {
  createFoundItem,
  getFoundItems,
  getMyFoundItems,
  getFoundItemById,
  updateFoundItem,
};

export default foundItemService;

