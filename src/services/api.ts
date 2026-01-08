import axios, { AxiosInstance } from 'axios';
import { extractSubdomain } from '../utils/subdomain';

/**
 * Centralized API Service
 * All backend API calls go through this single service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add restaurantId from localStorage for multi-tenant support
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config.url);
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// ==================== RESTAURANT API ====================

export const getRestaurantInfo = async () => {
  const response = await api.get('/restaurant/info');
  return response.data;
};

export const getRestaurantBySubdomain = async (subdomain: string) => {
  const response = await axios.get(`${API_BASE_URL}/api/restaurant/subdomain/${subdomain}`);
  return response.data;
};

// ==================== CATEGORIES API ====================

export const getCategories = async (includeInactive = false) => {
  const response = await api.get('/categories', {
    params: { includeInactive },
  });
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// ==================== MENU ITEMS API ====================

export const getMenuItems = async (params?: {
  category?: string;
  available?: boolean;
  dietary?: 'vegetarian' | 'vegan' | 'glutenFree';
}) => {
  const response = await api.get('/menu', { params });
  return response.data;
};

export const getMenuItemById = async (id: string) => {
  const response = await api.get(`/menu/${id}`);
  return response.data;
};

export const searchMenuItems = async (query: string, filters?: any) => {
  const response = await api.get('/search/menu', {
    params: { q: query, ...filters },
  });
  return response.data;
};

// ==================== TABLES API ====================

export const getTables = async () => {
  const response = await api.get('/tables');
  return response.data;
};

export const getTableById = async (id: string) => {
  const response = await api.get(`/tables/${id}`);
  return response.data;
};

export const getTableStatus = async (id: string) => {
  const response = await api.get(`/tables/${id}/status`);
  return response.data;
};

// ==================== ORDERS API ====================

export const createOrder = async (orderData: {
  tableId: string;
  items: any[];
  notes?: string;
}) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getTableOrders = async (tableId: string) => {
  const response = await api.get(`/orders`, {
    params: { tableId },
  });
  return response.data;
};

export const getOrdersByStatus = async (status: string) => {
  const response = await api.get('/orders', {
    params: { status },
  });
  return response.data;
};

// ==================== ORDER TRACKING (Customer) ====================

export const trackOrder = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export default api;
