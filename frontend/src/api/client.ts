import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('atlas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('atlas_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
