import { useState, useEffect } from 'react';
import { ordersApi } from '../api';
import { Order } from '../types';

/**
 * Custom hook to fetch and track a single order
 */
export const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ordersApi.getById(orderId);

      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  return {
    order,
    setOrder, // Allow external updates (e.g., from Socket.io)
    loading,
    error,
    refetch: fetchOrder,
  };
};
