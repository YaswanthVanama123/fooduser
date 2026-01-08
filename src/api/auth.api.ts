import { apiClient } from './client';

// Auth API endpoints
const authApi = {
  // Customer Registration
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const response = await apiClient.post('/customers/register', data);
    return response.data;
  },

  // Customer Login
  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post('/customers/login', data);
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await apiClient.get('/customers/me');
    return response.data;
  },

  // Update Profile
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    preferences?: any;
  }) => {
    const response = await apiClient.put('/customers/profile', data);
    return response.data;
  },

  // Change Password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await apiClient.put('/customers/password', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/customers/logout');
    return response.data;
  },

  // Get Order History
  getOrderHistory: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await apiClient.get('/customers/orders', { params });
    return response.data;
  },

  // Add to Favorites
  addFavorite: async (menuItemId: string) => {
    const response = await apiClient.post('/customers/favorites', { menuItemId });
    return response.data;
  },

  // Remove from Favorites
  removeFavorite: async (menuItemId: string) => {
    const response = await apiClient.delete(`/customers/favorites/${menuItemId}`);
    return response.data;
  },

  // Get Favorites
  getFavorites: async () => {
    const response = await apiClient.get('/customers/favorites');
    return response.data;
  },

  // Reorder
  reorder: async (orderId: string) => {
    const response = await apiClient.post(`/customers/orders/${orderId}/reorder`);
    return response.data;
  },
};

export default authApi;

