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

// Request interceptor - Add restaurantId, subdomain, and auth token headers
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

    // Add JWT token for authenticated requests
    const token = localStorage.getItem('customerToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
      // Only clear auth if it's an actual token expiry/invalid error
      // Don't clear on network errors or backend downtime
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        console.error('Token expired or invalid - clearing auth');
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customer');
        localStorage.removeItem('customerId');
        localStorage.removeItem('customerUsername');
        // Optionally redirect to login or show a message
      } else {
        console.warn('Received 401 but not clearing auth - might be temporary server issue');
      }
    } else if (!error.response) {
      // Network error - backend is down or unreachable
      console.warn('Network error - backend may be restarting or unreachable');
      // Don't clear auth data - keep user logged in
    }
    return Promise.reject(error);
  }
);

export default apiClient;
