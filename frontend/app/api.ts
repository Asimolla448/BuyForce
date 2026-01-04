// src/api/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // או process.env.NEXT_PUBLIC_API_URL
});

// interceptor שמוסיף Authorization אם יש token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
