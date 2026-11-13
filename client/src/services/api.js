import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token fallback if available in localStorage/session
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages consistently
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    let errors = [];

    if (error.response && error.response.data) {
      message = error.response.data.message || message;
      errors = error.response.data.errors || [];
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject({
      status: error.response ? error.response.status : 500,
      message,
      errors,
    });
  }
);

export default api;

