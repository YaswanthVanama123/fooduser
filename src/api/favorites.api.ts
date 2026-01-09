import { apiClient } from './client';

export interface Favorite {
  _id: string;
  customerId: string;
  menuItemId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    categoryId: {
      _id: string;
      name: string;
    };
    isAvailable: boolean;
    isVegetarian: boolean;
  };
  restaurantId: string;
  createdAt: string;
}

// Favorites API endpoints
const favoritesApi = {
  // Get customer's favorites
  getFavorites: async () => {
    const response = await apiClient.get('/customers/favorites');
    return response.data;
  },

  // Add item to favorites
  addFavorite: async (menuItemId: string) => {
    const response = await apiClient.post('/customers/favorites', { menuItemId });
    return response.data;
  },

  // Remove item from favorites
  removeFavorite: async (menuItemId: string) => {
    const response = await apiClient.delete(`/customers/favorites/${menuItemId}`);
    return response.data;
  },

  // Check if item is favorite
  isFavorite: async (menuItemId: string) => {
    const response = await apiClient.get(`/customers/favorites/check/${menuItemId}`);
    return response.data;
  },
};

export default favoritesApi;
