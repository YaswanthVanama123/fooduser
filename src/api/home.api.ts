import { apiClient } from './client';

/**
 * Home Page API
 * Combined endpoint that returns restaurant info, tables, and active order
 * This reduces 3 separate API calls into 1 for faster page load
 */
export const homeApi = {
  /**
   * Get all home page data in a single request
   * Returns:
   * - Restaurant information
   * - Tables list
   * - Active order (if authenticated)
   */
  getData: async () => {
    const response = await apiClient.get('/home');
    return response.data;
  },

  /**
   * Register FCM token for push notifications
   * Only call this if token is not already in localStorage
   */
  registerFCMToken: async (token: string) => {
    const response = await apiClient.post('/home/fcm-token', { token });
    return response.data;
  },
};

export default homeApi;
