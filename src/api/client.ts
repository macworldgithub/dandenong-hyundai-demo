import axios, { AxiosError } from 'axios';

const DEFAULT_API_BASE_URL = 'https://dandenong-hyundai-demo-backend.vercel.app/api';
const apiBaseUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).trim();

const client = axios.create({
  baseURL: apiBaseUrl.replace(/\/$/, ''),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token from localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 unauthenticated
// Only clear tokens for auth-related 401s, don't do hard redirects
// which cause race conditions when multiple API calls fire simultaneously.
client.interceptors.response.use(
  (response) => {
    if (response.config.method && !['get', 'head', 'options'].includes(response.config.method)) {
      window.dispatchEvent(new Event('accounting-data-updated'));
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only clear auth if we're not on the login page (login failures should not clear stored tokens)
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-expired'));
        // Use soft navigation — React router's ProtectedRoute will handle redirect
        // Avoid hard window.location.href which causes full-page reload race conditions
      }
    }
    return Promise.reject(error);
  }
);

export default client;
