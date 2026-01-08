import { apiClient } from './client';

/**
 * Orders API
 * Endpoints for order creation and tracking
 */

export interface CreateOrderData {
  tableId: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    customizations?: any[];
    subtotal: number;
    specialInstructions?: string;
  }[];
  notes?: string;
}

export const ordersApi = {
  /**
   * Create a new order
   */
  create: async (orderData: CreateOrderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Get orders for a specific table
   */
  getByTable: async (tableId: string) => {
    const response = await apiClient.get('/orders', {
      params: { tableId },
    });
    return response.data;
  },

  /**
   * Get orders by status
   */
  getByStatus: async (status: string) => {
    const response = await apiClient.get('/orders', {
      params: { status },
    });
    return response.data;
  },

  /**
   * Track order (for real-time updates)
   */
  track: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },
};

export default ordersApi;
