import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Strip trailing slashes and /api suffix so calls with '/api/...' don't produce '/api/api/...'
rawUrl = rawUrl.replace(/\/+$/, '');
if (rawUrl.endsWith('/api')) {
  rawUrl = rawUrl.slice(0, -4);
}

const api = axios.create({
  baseURL: rawUrl,
});

// Request interceptor: attach bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrosense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-redirect on 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/api/auth/login') ||
      error.config?.url?.includes('/api/auth/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('agrosense_token');
      localStorage.removeItem('agrosense_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, defaultMsg = 'Something went wrong. Please try again.') => {
  const detail = error.response?.data?.detail;
  if (detail) {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg ?? d).join(', ');
    if (typeof detail === 'object' && detail.error) return detail.error;
  }

  const directError = error.response?.data?.error;
  if (directError) return directError;

  if (error.message === 'Network Error') {
    return 'Cannot reach AgroSense backend server. Please verify it is running.';
  }

  return defaultMsg;
};

export default api;
