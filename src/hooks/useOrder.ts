import { useState, useEffect, useRef, useCallback } from 'react';
import { ordersApi } from '../api';
import { Order } from '../types';

/**
 * Custom hook to fetch and track a single order
 * Optimized to prevent duplicate API calls during React StrictMode
 */
export const useOrder = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent duplicate API calls
  const hasFetchedOrder = useRef(false);
  const previousOrderId = useRef(orderId);

  const fetchOrder = useCallback(async () => {
    // Check if orderId changed - if so, reset the guard
    if (orderId !== previousOrderId.current) {
      hasFetchedOrder.current = false;
      previousOrderId.current = orderId;
    }

    // Prevent duplicate calls
    if (hasFetchedOrder.current || !orderId) return;
    hasFetchedOrder.current = true;

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
      hasFetchedOrder.current = false; // Reset on error
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Manual refetch function (resets the guard)
  const refetch = useCallback(() => {
    hasFetchedOrder.current = false;
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    setOrder, // Allow external updates (e.g., from Socket.io)
    loading,
    error,
    refetch,
  };
};
