import { apiClient } from './client';

// Auth API endpoints - Simplified for username-only authentication
const authApi = {
  // Customer Registration - Username only
  register: async (data: { username: string }) => {
    const response = await apiClient.post('/customers/auth/register', data);
    return response.data;
  },

  // Customer Login - Username only
  login: async (data: { username: string }) => {
    const response = await apiClient.post('/customers/auth/login', data);
    return response.data;
  },

  // Get customer's active order
  getActiveOrder: async () => {
    const response = await apiClient.get('/customers/auth/active-order');
    return response.data;
  },

  // Get customer's order history
  getOrderHistory: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get('/customers/orders', { params });
    return response.data;
  },

  // Reorder from a previous order
  reorder: async (orderId: string) => {
    const response = await apiClient.post(`/customers/orders/${orderId}/reorder`);
    return response.data;
  },
};

export default authApi;

