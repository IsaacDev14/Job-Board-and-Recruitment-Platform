// frontend/src/api/api.ts
import axios from 'axios';

// Base API instance pointed to your backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // This is correct. It includes the /api prefix.
  headers: {
    'Content-Type': 'application/json',
    // 'withCredentials': true, // This header is usually handled by axios automatically for cross-origin requests if needed
  },
});

// Attach token to request headers if exists
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default api;