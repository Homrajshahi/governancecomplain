import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
});

// Attach JWT only for protected, non-auth endpoints
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const url = (config.url || '').toString();
  const isPublicAuthEndpoint = url.startsWith('auth/') || url.includes('/auth/');

  if (token && !isPublicAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (isPublicAuthEndpoint && config.headers?.Authorization) {
    // Ensure no stale Authorization header leaks into public endpoints
    delete config.headers.Authorization;
  }
  return config;
});

export default api;
