import axios from 'axios';
import { API_BASE_URL } from './config';

// Dev: same-origin + Vite `/api` proxy when VITE_API_BASE_URL is unset (see vite.config.js).
// Production: direct HTTPS API (see .env.production / config.js default).
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (import.meta.env.DEV ? '' : API_BASE_URL);

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
