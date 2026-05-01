import axios from 'axios';

const getApiBaseUrl = () => {
  const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return '/api';
  }

  const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');
  return normalizedBaseUrl.endsWith('/api')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// Attach the JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
