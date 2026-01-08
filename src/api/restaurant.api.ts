import { apiClient } from './client';

/**
 * Restaurant API
 * Endpoints for restaurant information and branding
 */

export const restaurantApi = {
  /**
   * Get current restaurant information by subdomain
   */
  getInfo: async () => {
    const response = await apiClient.get('/restaurant/info');
    return response.data;
  },

  /**
   * Get restaurant by specific subdomain
   */
  getBySubdomain: async (subdomain: string) => {
    const response = await apiClient.get(`/restaurant/subdomain/${subdomain}`);
    return response.data;
  },
};

export default restaurantApi;
