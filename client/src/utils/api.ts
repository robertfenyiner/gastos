import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = '/api';
let handlingAuthFailure = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || 'An error occurred';

    if (status === 401) {
      if (!handlingAuthFailure) {
        handlingAuthFailure = true;
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please login again.');
          window.location.replace('/login');
        }

        setTimeout(() => {
          handlingAuthFailure = false;
        }, 1500);
      }
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (status) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
