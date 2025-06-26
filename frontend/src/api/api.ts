// src/api/api.ts
import axios from 'axios';

// Base API instance pointed to your json-server
const api = axios.create({
  baseURL: ' http://127.0.0.1:5000/api', // This MUST match the port json-server is running on
  headers: {
    'Content-Type': 'application/json',
     withCredentials: true,
  },
});

// Interceptor to attach JWT (simulated) from localStorage for protected routes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    // In a real app, this would be a real JWT. For json-server, it's just a placeholder.
    // json-server doesn't enforce JWT, but it's good practice for when you move to a real backend.
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;