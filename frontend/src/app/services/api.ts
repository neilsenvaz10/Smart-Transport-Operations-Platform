import axios from 'axios';

// Base URL for the backend API. Vite env variable or fallback.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attach JWT token from localStorage if available.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('transitops_token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// On 401, clear token and redirect to /login (but not if already on an auth page).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register';
      if (!isAuthPage) {
        localStorage.removeItem('transitops_token');
        localStorage.removeItem('transitops_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
