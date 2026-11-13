import api from './api';

const createResponse = async (formData) => {
  return await api.post('/responses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getMyResponses = async () => {
  return await api.get('/responses/my');
};

const getResponsesForLostItem = async (lostItemId) => {
  return await api.get(`/responses/lost/${lostItemId}`);
};

const getResponseById = async (id) => {
  return await api.get(`/responses/${id}`);
};

const responseService = {
  createResponse,
  getMyResponses,
  getResponsesForLostItem,
  getResponseById,
};

export default responseService;

