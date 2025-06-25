// src/api/api.ts
import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: 'http://localhost:3001', // Change this to your Flask API when ready
});

// Attach JWT token to each request (if present)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
