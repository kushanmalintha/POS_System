import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:8080/api/',
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request if exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
