import axios from 'axios';

const getNormalizedApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url && !/^https?:\/\//i.test(url) && !url.startsWith('/')) {
    if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }
  if (url && !url.endsWith('/api')) {
    if (url.endsWith('/api/')) {
      url = url.slice(0, -1);
    } else {
      url = url.replace(/\/$/, '') + '/api';
    }
  }
  return url;
};

const API = axios.create({
  baseURL: getNormalizedApiUrl(),
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
