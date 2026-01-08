import { apiClient } from './client';

/**
 * Tables API
 * Endpoints for table management
 */

export const tablesApi = {
  /**
   * Get all tables
   */
  getAll: async () => {
    const response = await apiClient.get('/tables');
    return response.data;
  },

  /**
   * Get table by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get(`/tables/${id}`);
    return response.data;
  },

  /**
   * Get table status
   */
  getStatus: async (id: string) => {
    const response = await apiClient.get(`/tables/${id}/status`);
    return response.data;
  },
};

export default tablesApi;
