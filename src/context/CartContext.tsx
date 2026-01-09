import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  tableId: string | null;
  tableNumber: string | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setTable: (tableId: string, tableNumber: string) => void;
  getCartTotal: () => { subtotal: number; tax: number; total: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08;

// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage immediately to prevent flash of empty cart
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage('cart', []));
  const [tableId, setTableId] = useState<string | null>(() => localStorage.getItem('tableId'));
  const [tableNumber, setTableNumber] = useState<string | null>(() => localStorage.getItem('tableNumber'));

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveToStorage('cart', cart);
  }, [cart]);

  // Save table info to localStorage
  useEffect(() => {
    if (tableId) {
      localStorage.setItem('tableId', tableId);
    }
    if (tableNumber) {
      localStorage.setItem('tableNumber', tableNumber);
    }
  }, [tableId, tableNumber]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.menuItemId === item.menuItemId &&
        JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        updated[existingIndex].subtotal = updated[existingIndex].price * updated[existingIndex].quantity;
        console.log(`Updated cart item quantity: ${updated[existingIndex].name} x${updated[existingIndex].quantity}`);
        return updated;
      }

      console.log(`Added new item to cart: ${item.name} x${item.quantity}`);
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const item = prev.find(i => i.menuItemId === itemId);
      if (item) {
        console.log(`Removed from cart: ${item.name}`);
      }
      return prev.filter((item) => item.menuItemId !== itemId);
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.menuItemId === itemId) {
          console.log(`Updated quantity for ${item.name}: ${quantity}`);
          return { ...item, quantity, subtotal: item.price * quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    console.log('Cart cleared from state and localStorage');
  };

  const setTable = (id: string, number: string) => {
    setTableId(id);
    setTableNumber(number);
    localStorage.setItem('tableId', id);
    localStorage.setItem('tableNumber', number);
    console.log(`Table set: ${number} (ID: ${id})`);
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        tableId,
        tableNumber,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setTable,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
