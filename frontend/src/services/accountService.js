import api from '@/services/api';
import { API_ENDPOINTS } from '@/constants/routes';

export const accountService = {
  getUserInfo: async () => {
    const response = await api.get(API_ENDPOINTS.USER.INFO);
    return response.data;
  },

  updateUser: async (userData) => {
    const response = await api.put(API_ENDPOINTS.USER.UPDATE, userData);
    return response.data;
  },

  getAddresses: async () => {
    const response = await api.get(API_ENDPOINTS.ADDRESS.GET_ALL);
    return response.data;
  },

  addAddress: async (addressDto) => {
    const response = await api.post(API_ENDPOINTS.ADDRESS.ADD, addressDto);
    return response.data;
  },

  setDefaultAddress: async (addressId) => {
    const params = new URLSearchParams();
    params.append('addressId', addressId);

    const response = await api.post(API_ENDPOINTS.ADDRESS.SET_DEFAULT, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  }
};
