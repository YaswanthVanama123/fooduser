import { apiClient } from './client';

/**
 * Categories API
 * Endpoints for menu categories
 */

export const categoriesApi = {
  /**
   * Get all categories
   */
  getAll: async (includeInactive = false) => {
    const response = await apiClient.get('/categories', {
      params: { includeInactive },
    });
    return response.data;
  },

  /**
   * Get category by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },
};

export default categoriesApi;
