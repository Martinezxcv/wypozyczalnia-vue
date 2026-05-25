import api from '@/services/api';
import { API_ENDPOINTS } from '@/constants/routes';

export const authService = {
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.data.jwtToken) {
      localStorage.setItem('jwtToken', response.data.jwtToken);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('jwtToken');
    sessionStorage.removeItem('jwtToken');
  }
};
