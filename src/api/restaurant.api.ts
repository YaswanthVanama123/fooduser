import { apiClient } from './client';
import { extractSubdomain } from '../utils/subdomain';

/**
 * Restaurant API
 * Endpoints for restaurant information and branding
 */

export const restaurantApi = {
  /**
   * Get current restaurant information by subdomain
   */
  getInfo: async () => {
    // Extract subdomain from URL
    const { subdomain } = extractSubdomain();

    if (!subdomain) {
      throw new Error('No subdomain detected');
    }

    // Use the public endpoint to fetch restaurant by subdomain
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public/restaurants/by-subdomain/${subdomain}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch restaurant');
    }

    const data = await response.json();

    // Store restaurant ID for subsequent API calls
    if (data.success && data.data?.restaurantId) {
      localStorage.setItem('restaurantId', data.data.restaurantId);
    }

    return data;
  },

  /**
   * Get restaurant by specific subdomain
   */
  getBySubdomain: async (subdomain: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public/restaurants/by-subdomain/${subdomain}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch restaurant');
    }

    return response.json();
  },
};

export default restaurantApi;
