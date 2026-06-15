import api from './api';
import {API_ENDPOINTS} from "@/constants/routes";

export const orderService = {
  getOrders: async (isStaff) => {
    const response = await api.get(API_ENDPOINTS.ORDERS.GET_LIST(isStaff));
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await api.get(API_ENDPOINTS.ORDERS.DETAILS, { params: { orderId } });
    return response.data;
  },

  sendInvoice: async (orderId) => {
    return await api.get(API_ENDPOINTS.ORDERS.SEND_INVOICE, { params: { orderId } });
  },

  changeStatus: async (orderId, statusId) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.CHANGE_STATUS, {
      orderId,
      statusId
    });
    return response.data;
  }
};
