import { apiClient } from './client';

export interface ReviewData {
  menuItemId: string;
  orderId?: string;
  rating: number;
  comment?: string;
}

export interface Review {
  _id: string;
  customerId: {
    _id: string;
    username: string;
  };
  menuItemId: {
    _id: string;
    name: string;
    image?: string;
  };
  restaurantId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  helpful: string[];
  helpfulCount: number;
  isVisible: boolean;
  restaurantResponse?: {
    message: string;
    respondedAt: Date;
    respondedBy: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Reviews API endpoints
const reviewsApi = {
  // Get reviews with filters (public)
  getReviews: async (params?: {
    menuItemId?: string;
    rating?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) => {
    const response = await apiClient.get('/reviews', { params });
    return response.data;
  },

  // Get restaurant overall ratings (public)
  getRestaurantRatings: async () => {
    const response = await apiClient.get('/reviews/restaurant/ratings');
    return response.data;
  },

  // Get menu item ratings summary (public)
  getMenuItemRatings: async (menuItemId: string) => {
    const response = await apiClient.get(`/reviews/menu-item/${menuItemId}/ratings`);
    return response.data;
  },

  // Get customer's own reviews (requires auth)
  getMyReviews: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/reviews/my', { params });
    return response.data;
  },

  // Create review (requires auth)
  createReview: async (data: ReviewData) => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  // Update own review (requires auth)
  updateReview: async (reviewId: string, data: Partial<ReviewData>) => {
    const response = await apiClient.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete own review (requires auth)
  deleteReview: async (reviewId: string) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful (requires auth)
  markHelpful: async (reviewId: string) => {
    const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },
};

export default reviewsApi;
