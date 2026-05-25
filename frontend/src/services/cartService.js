import api from './api';
import {API_ENDPOINTS} from "@/constants/routes";

export const cartService = {
  addProduct: async (productName) => {

    const response = await api.post(API_ENDPOINTS.CART.ADD_ITEM, null, {
      params: { productName }
    });
    return response.data;
  },

  getCart: async () => {
    const response = await api.get(API_ENDPOINTS.CART.GET);
    return response.data;
  },

  deleteProduct: async (productName) => {
    const response = await api.delete(API_ENDPOINTS.CART.REMOVE_ITEM, {
      params: { productName }
    });
    return response.data;
  },

  placeOrder: async (startDate, endDate) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.GET, null, {
      params: {
        rentalDateStart: startDate,
        rentalDateEnd: endDate
      }
    });
    return response.data;
  },

};
