import axios, { AxiosInstance } from 'axios';
import { extractSubdomain } from '../utils/subdomain';

/**
 * Base API Client Configuration
 * Shared axios instance with interceptors for multi-tenant support
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add restaurantId and subdomain headers for multi-tenant support
apiClient.interceptors.request.use(
  (config) => {
    const { subdomain } = extractSubdomain();

    // For local development, use x-restaurant-id header
    const restaurantId = localStorage.getItem('restaurantId');
    if (restaurantId) {
      config.headers['x-restaurant-id'] = restaurantId;
    }

    // Add subdomain header for tenant identification
    if (subdomain) {
      config.headers['x-subdomain'] = subdomain;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config.url);
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    } else if (error.response?.status === 401) {
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
