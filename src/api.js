import axios from 'axios';

// Set `VITE_API_BASE_URL` in `.env.local` if your backend is not at the default (e.g. http://localhost:8080).
// In dev, when unset, baseURL is same-origin so Vite can proxy `/api` and avoid CORS (see vite.config.js).
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (import.meta.env.DEV ? '' : 'http://localhost:8080');

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
