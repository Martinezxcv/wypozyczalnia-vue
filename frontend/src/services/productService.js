import api from './api';
import { API_ENDPOINTS } from '@/constants/routes';

export const productService = {
  getAll: async () => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.GET_ALL);
    return response.data;
  },

  getByName: async (name) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.GET_BY_NAME(name));
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post(API_ENDPOINTS.PRODUCTS.CREATE, payload);
    return response.data;
  },

  update: async (payload) => {
    const response = await api.put(API_ENDPOINTS.PRODUCTS.UPDATE, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
    return response.data;
  }
};
