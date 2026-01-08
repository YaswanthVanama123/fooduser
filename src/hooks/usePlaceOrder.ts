import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ordersApi, CreateOrderData } from '../api/orders.api';
import { useCart } from '../context/CartContext';

/**
 * Custom hook to handle order placement
 */
export const usePlaceOrder = () => {
  const { cart, tableId, clearCart } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const placeOrder = useCallback(
    async (orderNotes?: string) => {
      if (cart.length === 0) {
        toast.error('Your cart is empty');
        return null;
      }

      if (!tableId) {
        toast.error('Please select a table first');
        return null;
      }

      try {
        setIsPlacing(true);

        const orderData: CreateOrderData = {
          tableId,
          items: cart.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            customizations: item.customizations || [],
            subtotal: item.subtotal,
            specialInstructions: item.specialInstructions,
          })),
          notes: orderNotes || undefined,
        };

        const response = await ordersApi.create(orderData);

        if (response.success) {
          const order = response.data;
          setPlacedOrder(order);
          clearCart();
          toast.success('Order placed successfully!');
          return order;
        } else {
          toast.error(response.message || 'Failed to place order');
          return null;
        }
      } catch (error: any) {
        console.error('Error placing order:', error);
        toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
        return null;
      } finally {
        setIsPlacing(false);
      }
    },
    [cart, tableId, clearCart]
  );

  return {
    placeOrder,
    isPlacing,
    placedOrder,
  };
};
