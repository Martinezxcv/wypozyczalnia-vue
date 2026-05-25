import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network connectivity lost. Please verify server status.");
      return Promise.reject(error);
    }

    const isUnauthorized = error.response.status === 401;
    const isLoginRequest = error.config.url?.includes('/auth/login') || error.config.url?.includes('/login');

    if (isUnauthorized && !isLoginRequest) {
      console.warn("Session token expired or unauthorized. Evicting dynamic contexts...");

      localStorage.removeItem('jwtToken');
      sessionStorage.removeItem('jwtToken');

      window.dispatchEvent(new Event('authExpired'));
    }

    return Promise.reject(error);
  }
);

export default api;
