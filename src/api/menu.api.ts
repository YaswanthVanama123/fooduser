import { apiClient } from './client';

/**
 * Menu API
 * Endpoints for menu items and search
 */

export interface MenuFilters {
  category?: string;
  available?: boolean;
  dietary?: 'vegetarian' | 'vegan' | 'glutenFree';
}

export const menuApi = {
  /**
   * Get all menu items with optional filters
   */
  getAll: async (filters?: MenuFilters) => {
    const response = await apiClient.get('/menu', { params: filters });
    return response.data;
  },

  /**
   * Get menu item by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get(`/menu/${id}`);
    return response.data;
  },

  /**
   * Search menu items
   */
  search: async (query: string, filters?: any) => {
    const response = await apiClient.get('/search/menu', {
      params: { q: query, ...filters },
    });
    return response.data;
  },
};

export default menuApi;
