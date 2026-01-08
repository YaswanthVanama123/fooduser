import { apiClient } from './client';

// Auth API endpoints - Simplified for username-only authentication
const authApi = {
  // Customer Registration - Username only
  register: async (data: { username: string }) => {
    const response = await apiClient.post('/customers/auth/register', data);
    return response.data;
  },

  // Customer Login - Username only
  login: async (data: { username: string }) => {
    const response = await apiClient.post('/customers/auth/login', data);
    return response.data;
  },
};

export default authApi;

